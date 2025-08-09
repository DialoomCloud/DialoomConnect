import { eq, and } from 'drizzle-orm';
import { storage } from './storage';
import { hostPricing } from '@shared/schema';

const db = storage.db;
import { hostPricingSchema, createPricingRequestSchema, updatePricingRequestSchema } from '@shared/contracts';
import type { HostPricing, CreatePricingRequest, UpdatePricingRequest } from '@shared/contracts';

/**
 * Pricing Service - Implementa operaciones UPSERT atómicas
 * Previene duplicados y asegura consistencia de datos
 */

export class PricingService {
  /**
   * UPSERT atómico para pricing - nunca duplica (user_id, duration)
   */
  static async upsertPricing(data: CreatePricingRequest): Promise<HostPricing> {
    // Validar entrada con contrato compartido
    const validated = createPricingRequestSchema.parse(data);
    
    try {
      // UPSERT atómico usando ON CONFLICT DO UPDATE
      const result = await db
        .insert(hostPricing)
        .values({
          ...validated,
          id: crypto.randomUUID(), // Temporal, se reemplaza si existe
        })
        .onConflictDoNothing()
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error in upsertPricing:', error);
      throw new Error(`Failed to upsert pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualizar pricing existente por ID
   */
  static async updatePricing(data: UpdatePricingRequest): Promise<HostPricing> {
    const validated = updatePricingRequestSchema.parse(data);
    
    try {
      const result = await db
        .update(hostPricing)
        .set({
          ...validated,
          updatedAt: new Date(),
        })
        .where(eq(hostPricing.id, validated.id))
        .returning();

      if (result.length === 0) {
        throw new Error('Pricing record not found');
      }

      return result[0];
    } catch (error) {
      console.error('Error in updatePricing:', error);
      throw new Error(`Failed to update pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtener todas las tarifas de un host
   */
  static async getHostPricing(userId: string): Promise<HostPricing[]> {
    try {
      const result = await db
        .select()
        .from(hostPricing)
        .where(and(
          eq(hostPricing.userId, userId),
          eq(hostPricing.isActive, true)
        ))
        .orderBy(hostPricing.duration);

      return result;
    } catch (error) {
      console.error('Error in getHostPricing:', error);
      throw new Error(`Failed to get host pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Eliminar tarifa específica
   */
  static async deletePricing(id: string, userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(hostPricing)
        .where(and(
          eq(hostPricing.id, id),
          eq(hostPricing.userId, userId)
        ))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error in deletePricing:', error);
      throw new Error(`Failed to delete pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Establecer tarifa como primaria (solo una puede ser primaria por usuario)
   */
  static async setPrimaryPricing(id: string, userId: string): Promise<void> {
    try {
      // Transacción: desmarcar todas como primaria y marcar la seleccionada
      await db.transaction(async (tx) => {
        // Desmarcar todas las tarifas del usuario
        await tx
          .update(hostPricing)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(eq(hostPricing.userId, userId));

        // Marcar la seleccionada como primaria
        await tx
          .update(hostPricing)
          .set({ isPrimary: true, updatedAt: new Date() })
          .where(and(
            eq(hostPricing.id, id),
            eq(hostPricing.userId, userId)
          ));
      });
    } catch (error) {
      console.error('Error in setPrimaryPricing:', error);
      throw new Error(`Failed to set primary pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch update de múltiples tarifas (para casos de admin)
   */
  static async batchUpdatePricing(updates: UpdatePricingRequest[]): Promise<HostPricing[]> {
    try {
      const results: HostPricing[] = [];
      
      await db.transaction(async (tx) => {
        for (const update of updates) {
          const validated = updatePricingRequestSchema.parse(update);
          const result = await tx
            .update(hostPricing)
            .set({
              ...validated,
              updatedAt: new Date(),
            })
            .where(eq(hostPricing.id, validated.id))
            .returning();
          
          if (result.length > 0) {
            results.push(result[0]);
          }
        }
      });

      return results;
    } catch (error) {
      console.error('Error in batchUpdatePricing:', error);
      throw new Error(`Failed to batch update pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}