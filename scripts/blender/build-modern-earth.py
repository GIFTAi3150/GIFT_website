"""Run through Blender MCP from the GIFT workspace. Builds a separate scene."""
import bpy, math, os
from mathutils import Vector
from pathlib import Path
ROOT = os.environ.get('GIFT_EARTH_ROOT') or str(Path(__file__).resolve().parents[2])
SOURCE = os.path.join(ROOT, '_source-assets', 'modern-earth')
OUTPUT = os.path.join(ROOT, 'public', 'models', 'earth')
scene = bpy.data.scenes.new('GIFT Modern Earth')
bpy.context.window.scene = scene
world = bpy.data.worlds.new('Earth Studio')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.025, 0.045, 0.09, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25
scene.world = world

def material(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    return mat, mat.node_tree.nodes.get('Principled BSDF')

def image_node(mat, filename):
    node = mat.node_tree.nodes.new('ShaderNodeTexImage')
    node.image = bpy.data.images.load(os.path.join(SOURCE, filename), check_existing=True)
    return node

def sphere(name, radius, segments, rings, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

earth_mat, earth_bsdf = material('Earth Surface')
day = image_node(earth_mat, 'day-web.jpg')
night = image_node(earth_mat, 'night-web.jpg')
earth_mat.node_tree.links.new(day.outputs['Color'], earth_bsdf.inputs['Base Color'])
earth_mat.node_tree.links.new(night.outputs['Color'], earth_bsdf.inputs['Emission Color'])
earth_bsdf.inputs['Emission Strength'].default_value = 0.65
earth_bsdf.inputs['Roughness'].default_value = 0.46
earth_bsdf.inputs['Specular IOR Level'].default_value = 0.25
earth = sphere('Earth_Surface', 1, 64, 48, earth_mat)
cloud_mat, cloud_bsdf = material('Cloud Layer')
cloud = image_node(cloud_mat, 'clouds-web.png')
cloud_mat.node_tree.links.new(cloud.outputs['Color'], cloud_bsdf.inputs['Base Color'])
cloud_mat.node_tree.links.new(cloud.outputs['Alpha'], cloud_bsdf.inputs['Alpha'])
cloud_bsdf.inputs['Roughness'].default_value = 1
cloud_mat.surface_render_method = 'DITHERED'
clouds = sphere('Earth_Clouds', 1.009, 64, 32, cloud_mat)
clouds.rotation_euler.z = math.radians(3)
atmo_mat, atmo_bsdf = material('Atmosphere Rim')
atmo_bsdf.inputs['Base Color'].default_value = (0.08, 0.36, 1, 1)
atmo_bsdf.inputs['Alpha'].default_value = 0.06
atmo_mat.surface_render_method = 'DITHERED'
atmo = sphere('Earth_Atmosphere', 1.035, 48, 32, atmo_mat)
# Export a portable mesh and texture asset; browser shaders add the day/night lighting.
bpy.ops.object.select_all(action='DESELECT')
for obj in (earth, clouds, atmo): obj.select_set(True)
bpy.context.view_layer.objects.active = earth
bpy.ops.export_scene.gltf(filepath=os.path.join(OUTPUT, 'earth.glb'), export_format='GLB', use_selection=True, use_active_scene=True, export_yup=True, export_animations=False, export_cameras=False, export_lights=False, export_image_format='AUTO', export_extras=False)
# Refine the source scene for the poster render.
nodes = earth_mat.node_tree.nodes
links = earth_mat.node_tree.links
normal = nodes.new('ShaderNodeNewGeometry')
dot = nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
sun_direction = Vector((-4, -0.3773, 0.1327)).normalized()
dot.inputs[1].default_value = sun_direction
links.new(normal.outputs['Normal'], dot.inputs[0])
mask = nodes.new('ShaderNodeMapRange'); mask.clamp = True
mask.inputs['From Min'].default_value = -0.12
mask.inputs['From Max'].default_value = 0.22
mask.inputs['To Min'].default_value = 1.3
mask.inputs['To Max'].default_value = 0
links.new(dot.outputs['Value'], mask.inputs['Value'])
links.new(mask.outputs['Result'], earth_bsdf.inputs['Emission Strength'])
# Transparent atmosphere with a luminous grazing-angle edge.
atmo_nodes = atmo_mat.node_tree.nodes; atmo_links = atmo_mat.node_tree.links
atmo_nodes.clear()
out = atmo_nodes.new('ShaderNodeOutputMaterial')
transparent = atmo_nodes.new('ShaderNodeBsdfTransparent')
emission = atmo_nodes.new('ShaderNodeEmission'); emission.inputs[0].default_value = (0.035, 0.23, 1, 1); emission.inputs[1].default_value = 0.7
fresnel = atmo_nodes.new('ShaderNodeFresnel'); fresnel.inputs['IOR'].default_value = 1.10
mix = atmo_nodes.new('ShaderNodeMixShader')
atmo_links.new(fresnel.outputs[0], mix.inputs[0]); atmo_links.new(transparent.outputs[0], mix.inputs[1]); atmo_links.new(emission.outputs[0], mix.inputs[2]); atmo_links.new(mix.outputs[0], out.inputs['Surface'])
atmo.scale = (0.987, 0.987, 0.987)
for obj in (earth, clouds): obj.rotation_euler.z += math.radians(-130)

def area(name, location, energy, color, size):
    data = bpy.data.lights.new(name, 'AREA'); data.energy = energy; data.color = color; data.shape = 'DISK'; data.size = size
    obj = bpy.data.objects.new(name, data); scene.collection.objects.link(obj); obj.location = location
    obj.rotation_euler = (-obj.location).to_track_quat('-Z', 'Y').to_euler()
area('Sun Key', (-4, -0.3773, 0.1327), 3, (0.84, 0.92, 1), 2)
sun = scene.objects['Sun Key']
sun.data.type = 'SUN'
sun.data.energy = 3
sun.data.angle = math.radians(0.53)
area('Blue Fill', (4, 1, 2), 10, (0.08, 0.24, 1), 4)
cam_data = bpy.data.cameras.new('Earth Portrait'); cam = bpy.data.objects.new('Earth Portrait', cam_data); scene.collection.objects.link(cam)
cam.location = (0, -5.4, 1.9); cam.rotation_euler = (-cam.location).to_track_quat('-Z', 'Y').to_euler(); cam_data.type = 'ORTHO'; cam_data.ortho_scale = 2.5
scene.camera = cam
scene.render.engine = 'CYCLES'; scene.cycles.samples = 32; scene.cycles.use_denoising = True
scene.render.resolution_x = 800; scene.render.resolution_y = 800; scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.render.filepath = os.path.join(SOURCE, 'earth-poster.png')
for image in bpy.data.images:
    if image.filepath.startswith(SOURCE): image.pack()
bpy.data.libraries.write(os.path.join(SOURCE, 'gift-modern-earth.blend'), {scene}, fake_user=True, compress=True)
for screen in bpy.data.screens:
    for area_view in screen.areas:
        if area_view.type == 'VIEW_3D':
            area_view.spaces.active.region_3d.view_perspective = 'CAMERA'
print('Created Earth surface, cloud shell, atmosphere, exported GLB and saved Blender source.')
bpy.ops.render.render(write_still=True)
print('Blender preview render completed. Use render-earth-poster.cjs for the website fallback.')
