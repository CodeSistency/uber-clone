import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useDiagnosticsStore, useRecentDiagnostics, usePerformanceSummary, useErrorSummary } from '@/lib/diagnostics/DiagnosticsManager';

/**
 * Dashboard de diagnósticos para desarrollo
 * Muestra métricas en tiempo real, eventos y errores
 */
export const DiagnosticsDashboard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'performance' | 'errors'>('events');
  
  const recentEvents = useRecentDiagnostics(20);
  const performanceSummary = usePerformanceSummary();
  const errorSummary = useErrorSummary();
  const { clearEvents, clearMetrics, clearErrors, setEnabled, isEnabled } = useDiagnosticsStore();
  
  // Auto-refresh cada 2 segundos
  useEffect(() => {
    if (!isExpanded) return;
    
    const interval = setInterval(() => {
      // Forzar re-render para actualizar datos
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isExpanded]);
  
  if (!__DEV__) {
    return null;
  }
  
  const renderEventsTab = () => (
    <ScrollView style={styles.tabContent}>
      {recentEvents.map((event) => (
        <View key={event.id} style={[styles.eventItem, styles[`event_${event.type}` as keyof typeof styles] as any]}>
          <Text style={styles.event_time}>
            {event.timestamp.toLocaleTimeString()}
          </Text>
          <Text style={styles.eventMessage}>
            [{event.category}] {event.message}
          </Text>
          {event.component && (
            <Text style={styles.eventComponent}>
              Component: {event.component}
            </Text>
          )}
          {event.duration && (
            <Text style={styles.eventDuration}>
              Duration: {event.duration.toFixed(2)}ms
            </Text>
          )}
        </View>
      ))}
      {recentEvents.length === 0 && (
        <Text style={styles.emptyState}>No events recorded</Text>
      )}
    </ScrollView>
  );
  
  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Performance Summary</Text>
        <Text style={styles.metricValue}>
          Avg Render Time: {performanceSummary.averageRenderTime.toFixed(2)}ms
        </Text>
        <Text style={styles.metricValue}>
          Total Re-renders: {performanceSummary.totalReRenders}
        </Text>
        <Text style={styles.metricValue}>
          Memory Peak: {(performanceSummary.memoryPeak / 1024 / 1024).toFixed(2)}MB
        </Text>
        <Text style={styles.metricValue}>
          Slowest Component: {performanceSummary.slowestComponent}
        </Text>
      </View>
    </View>
  );
  
  const renderErrorsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Error Summary</Text>
        <Text style={styles.metricValue}>
          Total Errors: {errorSummary.totalErrors}
        </Text>
        <Text style={styles.metricValue}>
          Unresolved: {errorSummary.unresolvedErrors}
        </Text>
        <Text style={styles.metricValue}>
          Most Common: {errorSummary.mostCommonError}
        </Text>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.headerTitle}>
          🔧 Diagnostics {isEnabled ? '🟢' : '🔴'}
        </Text>
        <Text style={styles.headerToggle}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setEnabled(!isEnabled)}
            >
              <Text style={styles.controlButtonText}>
                {isEnabled ? 'Disable' : 'Enable'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={clearEvents}
            >
              <Text style={styles.controlButtonText}>Clear Events</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={clearMetrics}
            >
              <Text style={styles.controlButtonText}>Clear Metrics</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={clearErrors}
            >
              <Text style={styles.controlButtonText}>Clear Errors</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'events' && styles.activeTab]}
              onPress={() => setActiveTab('events')}
            >
              <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
                Events ({recentEvents.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
              onPress={() => setActiveTab('performance')}
            >
              <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
                Performance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'errors' && styles.activeTab]}
              onPress={() => setActiveTab('errors')}
            >
              <Text style={[styles.tabText, activeTab === 'errors' && styles.activeTabText]}>
                Errors ({errorSummary.totalErrors})
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'errors' && renderErrorsTab()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 200,
    right: 10,
    width: 300,
    maxHeight: 400,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 8,
    zIndex: 10000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerToggle: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    maxHeight: 300,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 4,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 10,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'white',
    fontSize: 12,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  tabContent: {
    maxHeight: 200,
  },
  eventItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  event_time: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  event_info: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  event_warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  event_error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  event_debug: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  event_performance: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  eventMessage: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  eventComponent: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  eventDuration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  metricCard: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 8,
    borderRadius: 4,
  },
  metricTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricValue: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  emptyState: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
});
