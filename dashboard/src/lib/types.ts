// Types matching the FastAPI response models

export interface NodeMetrics {
  node_id: string;
  display_name: string;
  record_count: number;
  pending_count: number;
  last_activity: string | null;
  health_status: "healthy" | "idle" | "stale";
  breakdown: Record<string, number> | null;
}

export interface EdgeMetrics {
  source: string;
  target: string;
  label: string;
  total_records: number;
  recent_count: number;
}

export interface EcosystemSnapshot {
  timestamp: string;
  cycle_count: number;
  nodes: NodeMetrics[];
  edges: EdgeMetrics[];
  loop_health: "flowing" | "partial" | "idle";
}

export interface AgentSummary {
  id: string;
  name: string;
  role: string;
  category: string;
  framework_count: number;
  case_study_count: number;
  status: string;
}

export interface AgentDetail extends AgentSummary {
  background: string;
  era: string | null;
  notable_works: string[];
  voice_tone: string[];
  voice_phrases: string[];
  voice_style: string[];
  frameworks: string[];
  case_studies: string[];
  metadata: Record<string, unknown>;
}

export interface IdeaSummary {
  id: number;
  title: string;
  stage: string;
  status: string;
  overall_score: number | null;
  recommendation: string | null;
  caught_at: string;
  tags: string[];
}

export interface IdeaDetail extends IdeaSummary {
  raw_content: string;
  source_context: string | null;
  enrichment_result: Record<string, unknown> | null;
  evaluation_result: Record<string, unknown> | null;
  scaffolding_result: Record<string, unknown> | null;
  build_result: Record<string, unknown> | null;
  review_decision: string | null;
  review_notes: string | null;
  github_url: string | null;
  completed_at: string | null;
}

export interface RecentRecord {
  record_type: string;
  id: string;
  title: string;
  status: string;
  emitted_at: string;
  extra: Record<string, unknown>;
}

export interface NodeDetail {
  node_id: string;
  display_name: string;
  health_status: string;
  last_activity: string | null;
  metrics: NodeMetrics;
  recent_records: RecentRecord[];
}

export interface ActivityEvent {
  event_type: "outcome" | "recommendation" | "patch";
  id: string;
  title: string;
  status: string;
  node_id: string;
  timestamp: string;
  detail: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  sources: Record<string, string>;
}
