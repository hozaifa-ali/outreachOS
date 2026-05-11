-- OutreachOS ClickHouse Schema
-- High-volume email event analytics store

CREATE DATABASE IF NOT EXISTS outreachos;

CREATE TABLE IF NOT EXISTS outreachos.email_events_ch (
  event_id     UUID,
  org_id       UUID,
  campaign_id  UUID,
  contact_id   UUID,
  sent_id      UUID,
  event_type   LowCardinality(String),
  url          String DEFAULT '',
  ip           String DEFAULT '',
  occurred_at  DateTime64(3, 'UTC'),
  date         Date MATERIALIZED toDate(occurred_at)
)
ENGINE = MergeTree()
PARTITION BY date
ORDER BY (org_id, campaign_id, occurred_at);

-- Pre-aggregated campaign stats (refreshed by materialized view)
CREATE MATERIALIZED VIEW IF NOT EXISTS outreachos.campaign_stats_mv
ENGINE = SummingMergeTree()
ORDER BY (campaign_id, date)
AS SELECT
  campaign_id,
  toDate(occurred_at) AS date,
  countIf(event_type = 'open')        AS opens,
  countIf(event_type = 'click')       AS clicks,
  countIf(event_type = 'reply')       AS replies,
  countIf(event_type = 'bounce')      AS bounces,
  countIf(event_type = 'unsubscribe') AS unsubs,
  uniqIf(contact_id, event_type = 'open') AS unique_opens
FROM outreachos.email_events_ch
GROUP BY campaign_id, date;
