import React from 'react';
import { View, Text, ViewStyle, TextStyle, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { ThemeColors } from '../theme';
import { SPACING, TYPOGRAPHY } from '../constants';
import { Button } from './Button';
import logger from '../utils/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  componentStack?: string;
}

/**
 * Fallback UI shown when a descendant throws during render.
 */
function ErrorFallback({
  error,
  componentStack,
  onReset,
}: {
  error?: Error;
  componentStack?: string;
  onReset: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container} testID="error-boundary-fallback">
      <Icon name="alert-triangle" size={40} color={colors.textSecondary} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>
        The app hit an unexpected error. Your chats and models are saved on your device.
      </Text>

      {error?.message && (
        <ScrollView style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error.name}: {error.message}
          </Text>
          {componentStack ? (
            <Text style={styles.stackText}>{componentStack.trim()}</Text>
          ) : error.stack ? (
            <Text style={styles.stackText}>{error.stack.trim()}</Text>
          ) : null}
        </ScrollView>
      )}

      <Button title="Try Again" onPress={onReset} variant="primary" testID="error-boundary-retry" />
    </View>
  );
}

/**
 * Top-level error boundary.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Caught render error:', error?.message, info?.componentStack);
    this.setState({ componentStack: info?.componentStack });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, componentStack: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.componentStack}
          onReset={this.reset}
        />
      );
    }
    return this.props.children;
  }
}

const createStyles = (colors: ThemeColors): {
  container: ViewStyle;
  title: TextStyle;
  body: TextStyle;
  errorBox: ViewStyle;
  errorText: TextStyle;
  stackText: TextStyle;
} => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorBox: {
    maxHeight: 180,
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stackText: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'Courier',
  },
});
