import { Router } from 'express';
import { PricingService } from '../pricing-service';
import { validateApiRequest } from '@shared/contracts';
import { createPricingRequestSchema, updatePricingRequestSchema } from '@shared/contracts';

const router = Router();

/**
 * Pricing API Routes - Implementa contratos compartidos y operaciones atómicas
 * Previene duplicados y asegura consistencia
 */

// UPSERT pricing (crear o actualizar)
router.post('/pricing', async (req, res) => {
  try {
    const validated = validateApiRequest(createPricingRequestSchema, req.body);
    const result = await PricingService.upsertPricing(validated);
    
    res.json({
      success: true,
      data: result,
      message: 'Pricing updated successfully'
    });
  } catch (error) {
    console.error('Error in POST /pricing:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update pricing'
    });
  }
});

// Get pricing for a host
router.get('/pricing/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pricing = await PricingService.getHostPricing(userId);
    
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error in GET /pricing/:userId:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get pricing'
    });
  }
});

// Update specific pricing
router.put('/pricing/:id', async (req, res) => {
  try {
    const validated = validateApiRequest(updatePricingRequestSchema, {
      ...req.body,
      id: req.params.id
    });
    
    const result = await PricingService.updatePricing(validated);
    
    res.json({
      success: true,
      data: result,
      message: 'Pricing updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /pricing/:id:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update pricing'
    });
  }
});

// Delete pricing
router.delete('/pricing/:id/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const success = await PricingService.deletePricing(id, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Pricing deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Pricing not found'
      });
    }
  } catch (error) {
    console.error('Error in DELETE /pricing/:id/:userId:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete pricing'
    });
  }
});

// Set primary pricing
router.post('/pricing/:id/primary', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    await PricingService.setPrimaryPricing(id, userId);
    
    res.json({
      success: true,
      message: 'Primary pricing set successfully'
    });
  } catch (error) {
    console.error('Error in POST /pricing/:id/primary:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to set primary pricing'
    });
  }
});

// Batch update pricing (for admin operations)
router.post('/pricing/batch', async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'updates must be an array'
      });
    }
    
    const results = await PricingService.batchUpdatePricing(updates);
    
    res.json({
      success: true,
      data: results,
      message: `${results.length} pricing records updated successfully`
    });
  } catch (error) {
    console.error('Error in POST /pricing/batch:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to batch update pricing'
    });
  }
});

export default router;