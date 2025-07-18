import { Router } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all properties
router.get('/', async (req, res, next) => {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      status: 'success',
      data: {
        properties,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single property
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        project:projects (*),
        owner:users (*),
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!property) throw new AppError('No property found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new property
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      type,
      status,
      address,
      city,
      state,
      zipCode,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      description,
      projectId,
      ownerId,
      features,
      images,
    } = req.body;

    if (!name || !type || !address) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: property, error } = await supabase
      .from('properties')
      .insert([
        {
          name,
          type,
          status: status || 'available',
          address,
          city,
          state,
          zip_code: zipCode,
          price,
          bedrooms,
          bathrooms,
          square_feet: squareFeet,
          description,
          project_id: projectId,
          owner_id: ownerId,
          features,
          images,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update property
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!property) throw new AppError('No property found with that ID', 404);

    res.status(200).json({
      status: 'success',
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete property
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Add document to property
router.post('/:id/documents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, url, description } = req.body;

    if (!name || !type || !url) {
      throw new AppError('Please provide required fields', 400);
    }

    const { data: document, error } = await supabase
      .from('property_documents')
      .insert([
        {
          property_id: id,
          name,
          type,
          url,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove document from property
router.delete('/:id/documents/:documentId', async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    const { error } = await supabase
      .from('property_documents')
      .delete()
      .eq('property_id', id)
      .eq('id', documentId);

    if (error) throw new AppError(error.message, 400);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 