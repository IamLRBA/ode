import React, { ReactNode } from 'react';
import { Box, Typography, Alert, Stack, Divider } from '@mui/material';
import DOMPurify from 'dompurify';

/**
 * Safely renders HTML content by detecting HTML tags and rendering them
 * Uses DOMPurify for robust HTML sanitization and dangerouslySetInnerHTML
 * only when HTML is detected for security.
 *
 * This function is backward compatible - if no HTML tags are detected,
 * content is returned as-is for normal text rendering.
 */
const renderHtmlContent = (content: string | undefined): React.ReactNode => {
  if (!content) return null;

  // More precise HTML tag detection - looks for actual HTML tags, not just < followed by text
  // This avoids false positives like "Price < $100" or "x < 5"
  // Pattern: < followed by a letter (tag name), then optional attributes, then >
  const htmlTagPattern = /<[a-z][a-z0-9]*(\s+[^>]*)?>/i;
  const hasHtmlTags = htmlTagPattern.test(content);

  if (hasHtmlTags) {
    // Use DOMPurify for robust HTML sanitization
    // Allows safe HTML tags (strong, em, p, br, ul, ol, li, etc.) but removes dangerous content
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'strong',
        'b',
        'em',
        'i',
        'u',
        'p',
        'br',
        'div',
        'span',
        'ul',
        'ol',
        'li',
        'a',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel'], // Allow href for links, target and rel for security
      ALLOW_DATA_ATTR: false, // Disable data attributes for security
      KEEP_CONTENT: true, // Keep text content even if tags are removed
    });

    return <span dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  // No HTML tags detected, render as plain text (backward compatible)
  return content;
};

export interface QuestionShellProps {
  title?: string;
  description?: string;
  required?: boolean;
  error?: string | string[] | null;
  helperText?: ReactNode;
  actions?: ReactNode;
  metadata?: ReactNode;
  children: ReactNode;
}

const normalizeError = (error?: string | string[] | null): string | null => {
  if (!error) return null;
  if (Array.isArray(error)) {
    return error.filter(Boolean).join(', ') || null;
  }
  return error;
};

const QuestionShell: React.FC<QuestionShellProps> = ({
  title,
  description,
  required = false,
  error,
  helperText,
  actions,
  metadata,
  children,
}) => {
  const normalizedError = normalizeError(error);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {(title || description) && (
        <Stack spacing={0.5}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {renderHtmlContent(title)}
              {required && (
                <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                  *
                </Box>
              )}
            </Typography>
          )}
          {description && (
            <Typography variant="body1" color="text.secondary">
              {renderHtmlContent(description)}
            </Typography>
          )}
        </Stack>
      )}

      {normalizedError && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {normalizedError}
        </Alert>
      )}

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {children}
      </Box>

      {(helperText || actions) && (
        <Stack spacing={1}>
          {helperText && (
            <Typography variant="body2" color="text.secondary">
              {typeof helperText === 'string' ? renderHtmlContent(helperText) : helperText}
            </Typography>
          )}
          {actions}
        </Stack>
      )}

      {metadata && (
        <Stack spacing={1}>
          <Divider />
          <Box>{metadata}</Box>
        </Stack>
      )}
    </Box>
  );
};

export default QuestionShell;
