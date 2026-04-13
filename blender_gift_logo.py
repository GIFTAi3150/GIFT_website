"""
GIFT Logo 3D Generator for Blender
===================================
1. Open Blender (download from blender.org)
2. Delete everything in the default scene (A to select all, X to delete)
3. Go to the Scripting tab (top menu bar)
4. Click "New" to create a new script
5. Paste this entire file
6. Click "Run Script" (play button)
7. The .glb file will be saved to your Desktop

The script will:
- Import the GIFT SVG logo
- Extrude it with real depth
- Add subdivision for smooth curvature
- Curve the front face like a coin/badge
- Add metallic green + gold materials
- Set up dramatic half-shadow lighting
- Export as .glb ready for the website
"""

import bpy
import bmesh
import os
import math
from mathutils import Vector

# ============================================================
# CONFIGURATION — tweak these if you want
# ============================================================
SVG_PATH = os.path.expanduser(r"C:\Users\owner\Desktop\GIFT_website\public\GIFT_logo.svg")
OUTPUT_PATH = os.path.expanduser(r"C:\Users\owner\Desktop\GIFT_website\public\gift-logo.glb")

SHIELD_EXTRUDE_DEPTH = 0.01
G_EXTRUDE_DEPTH = 0.015
SUBDIVISION_LEVELS = 2
FRONT_BULGE = 0.005  # How much the front face curves outward

SHIELD_COLOR = (0.176, 0.420, 0.247, 1.0)  # #2d6b3f
GOLD_COLOR = (0.831, 0.686, 0.216, 1.0)    # #d4af37
SHIELD_METALNESS = 0.75
SHIELD_ROUGHNESS = 0.35
GOLD_METALNESS = 0.85
GOLD_ROUGHNESS = 0.25

# ============================================================
# STEP 1: Clean the scene
# ============================================================
print("Step 1: Cleaning scene...")
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Delete all orphan data
for block in bpy.data.meshes:
    if block.users == 0:
        bpy.data.meshes.remove(block)
for block in bpy.data.materials:
    if block.users == 0:
        bpy.data.materials.remove(block)
for block in bpy.data.curves:
    if block.users == 0:
        bpy.data.curves.remove(block)

# ============================================================
# STEP 2: Import SVG
# ============================================================
print("Step 2: Importing SVG...")
bpy.ops.import_curve.svg(filepath=SVG_PATH)

# Get all imported curve objects
curves = [obj for obj in bpy.context.scene.objects if obj.type == 'CURVE']
print(f"  Found {len(curves)} curve objects")

if len(curves) == 0:
    raise Exception("No curves imported from SVG! Check the file path.")

# ============================================================
# STEP 3: Identify shield vs G letter paths
# ============================================================
# The shield is the largest curve, the G parts are smaller
curves.sort(key=lambda c: max(c.dimensions.x, c.dimensions.y), reverse=True)

shield_curve = curves[0]
g_curves = curves[1:]

print(f"  Shield: {shield_curve.name} (size: {shield_curve.dimensions.x:.3f} x {shield_curve.dimensions.y:.3f})")
for gc in g_curves:
    print(f"  G part: {gc.name} (size: {gc.dimensions.x:.3f} x {gc.dimensions.y:.3f})")

# ============================================================
# STEP 4: Convert curves to meshes with extrusion
# ============================================================
print("Step 3: Converting to meshes...")

def curve_to_mesh(curve_obj, extrude_depth):
    """Convert a curve to a properly filled and extruded mesh."""
    # Set high resolution for smooth curves
    curve_obj.data.resolution_u = 64
    curve_obj.data.dimensions = '2D'
    curve_obj.data.fill_mode = 'BOTH'

    # Close all splines
    for spline in curve_obj.data.splines:
        spline.use_cyclic_u = True

    # Convert curve to mesh (this creates a flat filled shape)
    bpy.ops.object.select_all(action='DESELECT')
    curve_obj.select_set(True)
    bpy.context.view_layer.objects.active = curve_obj
    bpy.ops.object.convert(target='MESH')

    # If mesh has no faces, manually fill it
    mesh = curve_obj.data
    if len(mesh.polygons) == 0:
        bm = bmesh.new()
        bm.from_mesh(mesh)
        # Try to fill all edges
        edges = bm.edges[:]
        bmesh.ops.triangle_fill(bm, edges=edges)
        bm.to_mesh(mesh)
        bm.free()

    # Add solidify modifier for clean extrusion with beveled edges
    bpy.ops.object.select_all(action='DESELECT')
    curve_obj.select_set(True)
    bpy.context.view_layer.objects.active = curve_obj

    solidify = curve_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    solidify.thickness = extrude_depth
    solidify.offset = 0
    solidify.use_even_offset = True
    bpy.ops.object.modifier_apply(modifier=solidify.name)

    # Add bevel modifier for smooth edges
    bevel = curve_obj.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = extrude_depth * 0.15
    bevel.segments = 4
    bevel.limit_method = 'ANGLE'
    bpy.ops.object.modifier_apply(modifier=bevel.name)

    return curve_obj

shield_mesh = curve_to_mesh(shield_curve, SHIELD_EXTRUDE_DEPTH)
g_meshes = [curve_to_mesh(gc, G_EXTRUDE_DEPTH) for gc in g_curves]

# ============================================================
# STEP 5: Add subdivision for smooth surface
# ============================================================
print("Step 4: Adding subdivision...")

def add_subdivision(obj, levels):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = levels + 1
    bpy.ops.object.modifier_apply(modifier=mod.name)

add_subdivision(shield_mesh, SUBDIVISION_LEVELS)
for gm in g_meshes:
    add_subdivision(gm, SUBDIVISION_LEVELS)

# ============================================================
# STEP 6: Bulge the front face outward
# ============================================================
print("Step 5: Adding front face curvature...")

def bulge_front_face(obj, amount):
    """Push front-facing vertices outward based on distance from center."""
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()

    # Find bounding box center
    min_x = min(v.co.x for v in bm.verts)
    max_x = max(v.co.x for v in bm.verts)
    min_y = min(v.co.y for v in bm.verts)
    max_y = max(v.co.y for v in bm.verts)
    min_z = min(v.co.z for v in bm.verts)
    max_z = max(v.co.z for v in bm.verts)

    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2
    radius = max(max_x - min_x, max_y - min_y) / 2

    for v in bm.verts:
        # Only bulge front-facing vertices (positive Z or top half of extrusion)
        z_factor = (v.co.z - min_z) / max(max_z - min_z, 0.001)
        if z_factor > 0.5:
            dx = v.co.x - cx
            dy = v.co.y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            normalized = min(dist / max(radius, 0.001), 1.0)
            # Parabolic bulge — center pushes out most
            bulge = amount * (1.0 - normalized * normalized) * z_factor
            v.co.z += bulge

    bm.to_mesh(mesh)
    bm.free()
    mesh.update()

bulge_front_face(shield_mesh, FRONT_BULGE)
for gm in g_meshes:
    bulge_front_face(gm, FRONT_BULGE * 0.7)

# ============================================================
# STEP 7: Smooth shading + auto-smooth normals
# ============================================================
print("Step 6: Applying smooth shading...")

def smooth_shade(obj):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()

smooth_shade(shield_mesh)
for gm in g_meshes:
    smooth_shade(gm)

# ============================================================
# STEP 8: Create materials
# ============================================================
print("Step 7: Creating materials...")

def create_metal_material(name, color, metalness, roughness):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear defaults
    for node in nodes:
        nodes.remove(node)

    # Create Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Metallic'].default_value = metalness
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Coat Weight'].default_value = 0.3
    bsdf.inputs['Coat Roughness'].default_value = 0.2

    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat

shield_mat = create_metal_material("Shield_Green", SHIELD_COLOR, SHIELD_METALNESS, SHIELD_ROUGHNESS)
gold_mat = create_metal_material("G_Gold", GOLD_COLOR, GOLD_METALNESS, GOLD_ROUGHNESS)

# Assign materials
shield_mesh.data.materials.clear()
shield_mesh.data.materials.append(shield_mat)

for gm in g_meshes:
    gm.data.materials.clear()
    gm.data.materials.append(gold_mat)

# ============================================================
# STEP 9: Center and scale everything
# ============================================================
print("Step 8: Centering and scaling...")

# Select all mesh objects
all_meshes = [shield_mesh] + g_meshes
bpy.ops.object.select_all(action='DESELECT')
for obj in all_meshes:
    obj.select_set(True)
bpy.context.view_layer.objects.active = shield_mesh

# Join into one object for easier handling, then separate by material
# Actually keep them separate for different materials in glTF

# Center origins
for obj in all_meshes:
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Find the overall center
all_verts = []
for obj in all_meshes:
    for v in obj.data.vertices:
        world_co = obj.matrix_world @ v.co
        all_verts.append(world_co)

if all_verts:
    center = sum(all_verts, Vector()) / len(all_verts)
    for obj in all_meshes:
        obj.location -= center

# Scale to reasonable size (about 2 units tall)
max_dim = max(max(obj.dimensions) for obj in all_meshes)
if max_dim > 0:
    scale_factor = 2.0 / max_dim
    for obj in all_meshes:
        obj.scale *= scale_factor
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(scale=True)

# ============================================================
# STEP 10: Set up lighting for preview
# ============================================================
print("Step 9: Setting up lighting...")

# Add a single dramatic directional light
light_data = bpy.data.lights.new(name="KeyLight", type='SUN')
light_data.energy = 3.0
light_data.color = (1.0, 0.88, 0.75)  # Warm
light_obj = bpy.data.objects.new(name="KeyLight", object_data=light_data)
bpy.context.collection.objects.link(light_obj)
light_obj.rotation_euler = (math.radians(45), math.radians(-30), 0)

# Set world background to black
bpy.context.scene.world.use_nodes = True
bg = bpy.context.scene.world.node_tree.nodes.get('Background')
if bg:
    bg.inputs[0].default_value = (0, 0, 0, 1)
    bg.inputs[1].default_value = 0.0

# ============================================================
# STEP 11: Export as .glb
# ============================================================
print(f"Step 10: Exporting to {OUTPUT_PATH}...")

# Select all meshes for export
bpy.ops.object.select_all(action='DESELECT')
for obj in all_meshes:
    obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_materials='EXPORT',
    export_normals=True,
    export_tangents=True,
)

print("")
print("=" * 50)
print("DONE! Your 3D logo has been exported to:")
print(OUTPUT_PATH)
print("=" * 50)
print("")
print("Next steps:")
print("1. Tell Claude the .glb is ready")
print("2. Claude will load it into the website")
print("=" * 50)
