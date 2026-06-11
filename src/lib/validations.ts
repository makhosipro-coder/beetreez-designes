import { z } from 'zod';

export const designCreateSchema = z.object({
  id: z.string().min(1, 'Design ID is required'),
  name: z.string().optional().default('Untitled'),
  layers: z.array(z.unknown()).optional(),
  rootIds: z.array(z.string()).optional(),
  layerState: z.unknown().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
  teamId: z.string().optional().nullable(),
});

export const designUpdateSchema = z.object({
  name: z.string().optional(),
  layers: z.array(z.unknown()).optional(),
  layerState: z.record(z.unknown()).optional(),
  rootIds: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  teamId: z.string().optional().nullable(),
});

export const folderCreateSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  parentId: z.string().optional().nullable(),
});

export const folderUpdateSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
});

export const teamCreateSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
});

export const teamUpdateSchema = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
});

export const memberAddSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  role: z.enum(['admin', 'editor', 'viewer']).optional().default('viewer'),
  name: z.string().optional(),
});

export const memberUpdateSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be admin, editor, or viewer',
  }),
});

export const publishSchema = z.object({
  document: z.record(z.unknown()),
  layerState: z.record(z.unknown()),
  title: z.string().optional(),
  description: z.string().optional(),
  visibility: z.enum(['public', 'unlisted']).optional(),
});

export const ticketCreateSchema = z.object({
  designId: z.string().min(1),
  serviceType: z.enum(['mesh_repair', 'custom_glass', 'frame_align']),
  widthMm: z.number().positive().default(600),
  heightMm: z.number().positive().default(1200),
  depthMm: z.number().positive().default(50),
  materialType: z.string().default('aluminum'),
  assignedFabricatorId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const ticketUpdateSchema = z.object({
  serviceType: z.enum(['mesh_repair', 'custom_glass', 'frame_align']).optional(),
  widthMm: z.number().positive().optional(),
  heightMm: z.number().positive().optional(),
  depthMm: z.number().positive().optional(),
  materialType: z.string().optional(),
  assignedFabricatorId: z.string().optional().nullable(),
  status: z.enum(['draft', 'pending', 'approved', 'in_production', 'completed', 'cancelled']).optional(),
  notes: z.string().optional().nullable(),
});

export const shipmentCreateSchema = z.object({
  designId: z.string().min(1),
  carrierId: z.string().min(1),
  carrierName: z.string().default('TBD'),
  trackingNumber: z.string().optional().nullable(),
  packageWeightKg: z.number().nonnegative().default(0),
  origin: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const shipmentUpdateSchema = z.object({
  carrierId: z.string().optional(),
  carrierName: z.string().optional(),
  trackingNumber: z.string().optional().nullable(),
  packageWeightKg: z.number().nonnegative().optional(),
  cargoStatus: z.enum(['manifested', 'in_transit', 'delayed', 'delivered']).optional(),
  currentEta: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
