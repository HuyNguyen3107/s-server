/**
 * Background Configuration Types
 * Defines the structure for dynamic form fields in background customization
 */

// Enum for field types
export enum BackgroundFieldType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  SELECT = 'select',
  DATE = 'date',
  IMAGE_UPLOAD = 'image_upload',
}

// Base interface for all field configurations
export interface BaseFieldConfig {
  id: string; // Unique identifier for the field
  type: BackgroundFieldType;
  title: string; // Field label/title
  description?: string; // Field description/helper text
  imageUrl?: string; // Optional image to display with the field
  required: boolean; // Whether the field is mandatory
  order: number; // Display order
}

// Short text field configuration
export interface ShortTextField extends BaseFieldConfig {
  type: BackgroundFieldType.SHORT_TEXT;
  placeholder?: string;
  maxLength?: number;
  defaultValue?: string;
}

// Long text field configuration
export interface LongTextField extends BaseFieldConfig {
  type: BackgroundFieldType.LONG_TEXT;
  placeholder?: string;
  maxLength?: number;
  rows?: number; // Number of rows for textarea
  defaultValue?: string;
}

// Select field option
export interface SelectOption {
  id: string;
  label: string;
  value: string;
}

// Select field configuration
export interface SelectField extends BaseFieldConfig {
  type: BackgroundFieldType.SELECT;
  options: SelectOption[];
  allowOther: boolean; // Allow "Other" option with custom text input
  otherPlaceholder?: string; // Placeholder for "Other" text input
  defaultValue?: string;
}

// Date field configuration
export interface DateField extends BaseFieldConfig {
  type: BackgroundFieldType.DATE;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  defaultValue?: string; // ISO date string
}

// Image upload field configuration
export interface ImageUploadField extends BaseFieldConfig {
  type: BackgroundFieldType.IMAGE_UPLOAD;
  maxFiles?: number; // Maximum number of images allowed
  maxFileSize?: number; // Maximum file size in bytes
  allowedFormats?: string[]; // Allowed MIME types
  minFiles?: number; // Minimum number of images required
}

// Union type for all field configurations
export type BackgroundFieldConfig =
  | ShortTextField
  | LongTextField
  | SelectField
  | DateField
  | ImageUploadField;

// Main configuration structure stored in database
export interface BackgroundConfig {
  version: string; // Schema version for future migrations
  fields: BackgroundFieldConfig[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };
}

// Field value types for user submissions
export interface FieldValue {
  fieldId: string;
  value: string | string[] | null; // string for text/date, string[] for images, null for empty
  otherValue?: string; // For select fields with "Other" option
}

// User submission structure
export interface BackgroundSubmission {
  backgroundId: string;
  values: FieldValue[];
  submittedAt: string;
  submittedBy?: string;
}

// Validation result
export interface FieldValidationResult {
  fieldId: string;
  valid: boolean;
  errors: string[];
}

export interface ConfigValidationResult {
  valid: boolean;
  fieldResults: FieldValidationResult[];
  globalErrors?: string[];
}
