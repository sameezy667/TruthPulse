'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UIComponent } from '@/lib/generative-ui-engine';
import TextComponent from '@/components/ui/TextComponent';
import BadgeComponent from '@/components/ui/BadgeComponent';
import CardComponent from '@/components/ui/CardComponent';
import ListComponent from '@/components/ui/ListComponent';
import ChartComponent from '@/components/ui/ChartComponent';

interface DynamicRendererProps {
  components: UIComponent[];
}

/**
 * Component map for dynamic rendering
 * Maps UIComponent types to actual React components
 */
const componentMap = {
  text: TextComponent,
  badge: BadgeComponent,
  card: CardComponent,
  list: ListComponent,
  chart: ChartComponent,
};

/**
 * DynamicRenderer - Renders dynamically generated UI components
 * 
 * This component takes an array of UIComponent definitions and renders them
 * with smooth animations and proper error handling. It supports nested children
 * and staggered animation delays for a polished streaming effect.
 */
export default function DynamicRenderer({ components }: DynamicRendererProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <AnimatePresence mode="popLayout">
        {components.map((comp, index) => (
          <ComponentWrapper
            key={`${comp.type}-${index}`}
            component={comp}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * ComponentWrapper - Wraps each component with animation and error boundary
 */
function ComponentWrapper({
  component,
  index,
}: {
  component: UIComponent;
  index: number;
}) {
  const Component = componentMap[component.type] as React.ComponentType<any>;

  if (!Component) {
    console.error(`Unknown component type: ${component.type}`);
    return null;
  }

  // Handle children rendering
  const hasChildren = component.children && component.children.length > 0;
  const childrenElement = hasChildren ? (
    <DynamicRenderer components={component.children!} />
  ) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        delay: index * 0.1, // Staggered animation
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <ErrorBoundary componentType={component.type}>
        <Component {...component.props}>
          {childrenElement}
        </Component>
      </ErrorBoundary>
    </motion.div>
  );
}

/**
 * ErrorBoundary - Catches rendering errors and displays fallback UI
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentType: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentType: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Error rendering ${this.props.componentType}:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">
            Failed to render {this.props.componentType} component
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import React for ErrorBoundary
import React from 'react';
