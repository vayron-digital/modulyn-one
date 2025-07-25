import { supabase } from '../lib/supabase';

export interface JourneyCard {
  id: string;
  title: string;
  stage: 'awareness' | 'consideration' | 'decision' | 'retention';
  avatar_url?: string;
  status: 'green' | 'blue' | 'red' | 'yellow';
  completed: boolean;
  highlight: boolean;
  pill: boolean;
  position: number;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export interface CreateJourneyCardData {
  title: string;
  stage: 'awareness' | 'consideration' | 'decision' | 'retention';
  avatar_url?: string;
  status?: 'green' | 'blue' | 'red' | 'yellow';
}

export interface UpdateJourneyCardData {
  title?: string;
  stage?: 'awareness' | 'consideration' | 'decision' | 'retention';
  avatar_url?: string;
  status?: 'green' | 'blue' | 'red' | 'yellow';
  completed?: boolean;
  highlight?: boolean;
  pill?: boolean;
}

export interface ReorderData {
  sourceStage: string;
  destinationStage: string;
  sourceIndex: number;
  destinationIndex: number;
  cardId: string;
}

export interface Journey {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export async function getJourneys(userId: string): Promise<Journey[]> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }
  const { data: journeys, error } = await supabase
    .from('journeys')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Failed to fetch journeys: ${error.message}`);
  return journeys || [];
}

export async function createJourney(userId: string, name: string, description?: string): Promise<Journey> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }
  const { data: journey, error } = await supabase
    .from('journeys')
    .insert({
      name,
      description,
      created_by: userId,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create journey: ${error.message}`);
  return journey;
}

export async function updateJourney(userId: string, journeyId: string, data: Partial<Journey>): Promise<Journey> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }
  const { data: journey, error } = await supabase
    .from('journeys')
    .update(data)
    .eq('id', journeyId)
    .eq('tenant_id', profile.tenant_id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update journey: ${error.message}`);
  return journey;
}

export async function deleteJourney(userId: string, journeyId: string): Promise<void> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }
  const { error } = await supabase
    .from('journeys')
    .delete()
    .eq('id', journeyId)
    .eq('tenant_id', profile.tenant_id);
  if (error) throw new Error(`Failed to delete journey: ${error.message}`);
}

// JourneyColumn type
export interface JourneyColumn {
  id: string;
  journey_id: string;
  name: string;
  position: number;
  created_at: string;
}

// Get all columns for a journey, ordered by position
export async function getJourneyColumns(journeyId: string): Promise<JourneyColumn[]> {
  const { data, error } = await supabase
    .from('journey_columns')
    .select('*')
    .eq('journey_id', journeyId)
    .order('position', { ascending: true });
  if (error) throw new Error(`Failed to fetch columns: ${error.message}`);
  return data || [];
}

// Create a new column for a journey
export async function createJourneyColumn(journeyId: string, name: string, position: number): Promise<JourneyColumn> {
  const { data, error } = await supabase
    .from('journey_columns')
    .insert({ journey_id: journeyId, name, position })
    .select()
    .single();
  if (error) throw new Error(`Failed to create column: ${error.message}`);
  return data;
}

// Update a column (rename, move)
export async function updateJourneyColumn(columnId: string, data: Partial<JourneyColumn>): Promise<JourneyColumn> {
  const { data: updated, error } = await supabase
    .from('journey_columns')
    .update(data)
    .eq('id', columnId)
    .select()
    .single();
  if (error) throw new Error(`Failed to update column: ${error.message}`);
  return updated;
}

// Delete a column
export async function deleteJourneyColumn(columnId: string): Promise<void> {
  const { error } = await supabase
    .from('journey_columns')
    .delete()
    .eq('id', columnId);
  if (error) throw new Error(`Failed to delete column: ${error.message}`);
}

// Reorder columns (update positions)
export async function reorderJourneyColumns(journeyId: string, newOrder: string[]): Promise<void> {
  for (let i = 0; i < newOrder.length; i++) {
    await supabase
      .from('journey_columns')
      .update({ position: i + 1 })
      .eq('id', newOrder[i])
      .eq('journey_id', journeyId);
  }
}

// Update getJourneyCards to join with columns and return cards grouped by column_id
export async function getJourneyCards(userId: string, journeyId: string): Promise<{ [columnId: string]: JourneyCard[] }> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }
  const { data: cards, error } = await supabase
    .from('journey_cards')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('journey_id', journeyId)
    .order('position', { ascending: true });
  if (error) throw new Error(`Failed to fetch journey cards: ${error.message}`);
  // Group cards by column_id
  const grouped: { [columnId: string]: JourneyCard[] } = {};
  (cards || []).forEach(card => {
    if (!card.column_id) return;
    if (!grouped[card.column_id]) grouped[card.column_id] = [];
    grouped[card.column_id].push(card);
  });
  return grouped;
}

export async function createJourneyCard(userId: string, data: CreateJourneyCardData): Promise<JourneyCard> {
  // Get user's tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }

  // Get the next position for the stage
  const { data: maxPosition, error: maxError } = await supabase
    .from('journey_cards')
    .select('position')
    .eq('tenant_id', profile.tenant_id)
    .eq('stage', data.stage)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const nextPosition = (maxPosition?.position || 0) + 1;

  // Create the new card
  const { data: card, error } = await supabase
    .from('journey_cards')
    .insert({
      title: data.title,
      stage: data.stage,
      avatar_url: data.avatar_url || '/public/default-avatar.png',
      status: data.status || 'blue',
      position: nextPosition,
      created_by: userId,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create journey card: ${error.message}`);
  }

  return card;
}

export async function updateJourneyCard(userId: string, cardId: string, data: UpdateJourneyCardData): Promise<JourneyCard> {
  // Get user's tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }

  // Update the card
  const { data: card, error } = await supabase
    .from('journey_cards')
    .update(data)
    .eq('id', cardId)
    .eq('tenant_id', profile.tenant_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update journey card: ${error.message}`);
  }

  if (!card) {
    throw new Error('Journey card not found');
  }

  return card;
}

export async function deleteJourneyCard(userId: string, cardId: string): Promise<void> {
  // Get user's tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }

  // Delete the card
  const { error } = await supabase
    .from('journey_cards')
    .delete()
    .eq('id', cardId)
    .eq('tenant_id', profile.tenant_id);

  if (error) {
    throw new Error(`Failed to delete journey card: ${error.message}`);
  }
}

export async function reorderJourneyCards(userId: string, reorderData: ReorderData): Promise<JourneyCard[]> {
  // Get user's tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.tenant_id) {
    throw new Error('User profile not found or no tenant assigned');
  }

  const { sourceStage, destinationStage, sourceIndex, destinationIndex, cardId } = reorderData;

  // Start a transaction
  const { data: cards, error } = await supabase.rpc('reorder_journey_cards', {
    p_tenant_id: profile.tenant_id,
    p_card_id: cardId,
    p_source_stage: sourceStage,
    p_destination_stage: destinationStage,
    p_source_index: sourceIndex,
    p_destination_index: destinationIndex
  });

  if (error) {
    // If the RPC function doesn't exist, fall back to manual reordering
    return await manualReorderJourneyCards(profile.tenant_id, reorderData);
  }

  return cards || [];
}

async function manualReorderJourneyCards(tenantId: string, reorderData: ReorderData): Promise<JourneyCard[]> {
  const { sourceStage, destinationStage, sourceIndex, destinationIndex, cardId } = reorderData;

  // Get all cards in the source stage
  const { data: sourceCards, error: sourceError } = await supabase
    .from('journey_cards')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('stage', sourceStage)
    .order('position', { ascending: true });

  if (sourceError) {
    throw new Error(`Failed to fetch source cards: ${sourceError.message}`);
  }

  // Get all cards in the destination stage
  const { data: destCards, error: destError } = await supabase
    .from('journey_cards')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('stage', destinationStage)
    .order('position', { ascending: true });

  if (destError) {
    throw new Error(`Failed to fetch destination cards: ${destError.message}`);
  }

  // Remove the card from source stage
  const updatedSourceCards = sourceCards?.filter(card => card.id !== cardId) || [];
  
  // Reorder source stage positions
  for (let i = 0; i < updatedSourceCards.length; i++) {
    await supabase
      .from('journey_cards')
      .update({ position: i + 1 })
      .eq('id', updatedSourceCards[i].id);
  }

  // Insert card into destination stage
  const updatedDestCards = [...(destCards || [])];
  updatedDestCards.splice(destinationIndex, 0, { ...sourceCards?.find(c => c.id === cardId)!, position: destinationIndex + 1 });

  // Reorder destination stage positions
  for (let i = 0; i < updatedDestCards.length; i++) {
    await supabase
      .from('journey_cards')
      .update({ position: i + 1 })
      .eq('id', updatedDestCards[i].id);
  }

  // Update the moved card's stage
  await supabase
    .from('journey_cards')
    .update({ stage: destinationStage })
    .eq('id', cardId);

  // Return updated cards
  return await getJourneyCards(tenantId, reorderData.cardId); // Assuming cardId is the journeyId for this context
} 