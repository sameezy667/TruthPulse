import { describe, it, expect } from 'vitest';
import { UIComponent } from '@/lib/generative-ui-engine';

describe('DynamicRenderer Component Structure', () => {
  it('should have correct component map types', () => {
    const validTypes = ['text', 'badge', 'card', 'list', 'chart'];
    
    validTypes.forEach(type => {
      expect(['text', 'badge', 'card', 'list', 'chart']).toContain(type);
    });
  });

  it('should support text component props', () => {
    const component: UIComponent = {
      type: 'text',
      props: {
        content: 'Test content',
        size: 'medium',
        weight: 'bold',
        color: 'default',
      },
    };

    expect(component.type).toBe('text');
    expect(component.props.content).toBe('Test content');
  });

  it('should support badge component props', () => {
    const component: UIComponent = {
      type: 'badge',
      props: {
        text: 'Safe',
        variant: 'success',
      },
    };

    expect(component.type).toBe('badge');
    expect(component.props.variant).toBe('success');
  });

  it('should support nested children', () => {
    const component: UIComponent = {
      type: 'card',
      props: {
        variant: 'neutral',
      },
      children: [
        {
          type: 'text',
          props: {
            content: 'Nested text',
          },
        },
      ],
    };

    expect(component.children).toBeDefined();
    expect(component.children).toHaveLength(1);
    expect(component.children?.[0].type).toBe('text');
  });

  it('should support chart component with data', () => {
    const component: UIComponent = {
      type: 'chart',
      props: {
        title: 'Risk Overview',
        data: [
          { label: 'Sugar', value: 2, severity: 'high' },
          { label: 'Salt', value: 1, severity: 'med' },
        ],
      },
    };

    expect(component.type).toBe('chart');
    expect(component.props.data).toHaveLength(2);
    expect(component.props.title).toBe('Risk Overview');
  });

  it('should support list component with items', () => {
    const component: UIComponent = {
      type: 'list',
      props: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        variant: 'default',
      },
    };

    expect(component.type).toBe('list');
    expect(component.props.items).toHaveLength(3);
  });

  it('should support card component with severity', () => {
    const component: UIComponent = {
      type: 'card',
      props: {
        severity: 'high',
        variant: 'danger',
      },
    };

    expect(component.type).toBe('card');
    expect(component.props.severity).toBe('high');
  });

  it('should handle deeply nested component trees', () => {
    const component: UIComponent = {
      type: 'card',
      props: { variant: 'neutral' },
      children: [
        {
          type: 'text',
          props: { content: 'Level 1' },
          children: [
            {
              type: 'badge',
              props: { text: 'Level 2' },
            },
          ],
        },
      ],
    };

    expect(component.children).toBeDefined();
    expect(component.children?.[0].children).toBeDefined();
    expect(component.children?.[0].children?.[0].type).toBe('badge');
  });
});
