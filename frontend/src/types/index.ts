// User
export interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

// Auth
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Pack
export interface Pack {
  id: number;
  oem: string;
  model: string;
  year: number;
  variant: string | null;
  market: string | null;
  fuel_type: string | null;
  vehicle_class: string | null;
  drivetrain: string | null;
  platform: string | null;
  is_active: boolean;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackListResponse {
  items: Pack[];
  total: number;
  page: number;
  page_size: number;
}

// Domain
export interface Domain {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

// Field
export interface Field {
  id: number;
  domain_id: number;
  name: string;
  display_name: string;
  unit: string | null;
  data_type: string;
  select_options: string[] | null;
  sort_order: number;
  description: string | null;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
}

// Value
export interface FieldValue {
  id: number;
  pack_id: number;
  field_id: number;
  value_text: string | null;
  value_numeric: number | null;
  source_type: string;
  source_detail: string;
  contributed_by: number;
  contributor_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  comment_count: number;
}

// Resolved field (from pack detail / compare)
export interface ResolvedFieldValue {
  field_id: number;
  field_name: string;
  display_name: string;
  unit: string | null;
  data_type: string;
  resolved_value: FieldValue | null;
  alternative_count: number;
  all_values: FieldValue[];
}

// Domain with resolved fields (from pack detail)
export interface DomainWithResolvedFields {
  domain_id: number;
  domain_name: string;
  sort_order: number;
  fields: ResolvedFieldValue[];
}

// Pack detail response (flat — pack fields at top level + domains)
export interface PackDetailResponse {
  id: number;
  oem: string;
  model: string;
  year: number;
  variant: string | null;
  market: string | null;
  fuel_type: string | null;
  vehicle_class: string | null;
  drivetrain: string | null;
  platform: string | null;
  is_active: boolean;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
  domains: DomainWithResolvedFields[];
}

// Compare types
export interface CompareFieldEntry {
  field_id: number;
  field_name: string;
  display_name: string;
  unit: string | null;
  data_type: string;
  values_by_pack: Record<number, FieldValue | null>;
}

export interface CompareDomainEntry {
  domain_id: number;
  domain_name: string;
  sort_order: number;
  fields: CompareFieldEntry[];
}

export interface CompareResponse {
  packs: Pack[];
  domains: CompareDomainEntry[];
}

// Comment
export interface Comment {
  id: number;
  value_id: number;
  author_id: number;
  author_name: string | null;
  text: string;
  created_at: string;
}

// Source priority
export interface SourcePriority {
  user_id: number;
  priority_order: string[];
}

// Source types (constant)
export const SOURCE_TYPES = [
  'teardown', 'a2mac1', 'oem', 'regulatory',
  'cad', 'calculated', 'press', 'user'
] as const;

export type SourceType = typeof SOURCE_TYPES[number];

// Source badge display info
export const SOURCE_DISPLAY: Record<SourceType, { label: string; color: string }> = {
  teardown:   { label: 'Teardown',       color: '#ef4444' },
  a2mac1:     { label: 'A2Mac1',         color: '#f97316' },
  oem:        { label: 'OEM Official',   color: '#3b82f6' },
  regulatory: { label: 'Regulatory',     color: '#6366f1' },
  cad:        { label: 'CAD / 3D',       color: '#06b6d4' },
  calculated: { label: 'Calculated',     color: '#f59e0b' },
  press:      { label: 'Press / Media',  color: '#94a3b8' },
  user:       { label: 'User Submitted', color: '#6b7280' },
};
