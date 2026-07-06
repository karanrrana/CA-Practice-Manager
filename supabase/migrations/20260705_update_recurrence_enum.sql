-- =====================================================
-- Add Half-Yearly recurrence option
-- =====================================================

ALTER TYPE public.recurrence_type
ADD VALUE IF NOT EXISTS 'Half-Yearly';