/**
 * Sistema de logging condicional para la aplicación
 * Solo muestra logs en desarrollo (__DEV__) para optimizar performance
 */

export const isDev = __DEV__;

export interface LogContext {
  component?: string;
  action?: string;
  data?: any;
}

export interface LogOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  context?: LogContext;
  force?: boolean; // Forzar log incluso en producción
}

class Logger {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const contextStr = context ? `[${context.component || 'App'}${context.action ? `:${context.action}` : ''}]` : '[App]';
    return `${timestamp} ${contextStr} ${message}`;
  }

  private shouldLog(level: string, force?: boolean): boolean {
    if (force) return true;
    if (!isDev) return false;
    
    // En desarrollo, mostrar todos los logs
    return true;
  }

  debug(message: string, context?: LogContext, force?: boolean): void {
    if (!this.shouldLog('debug', force)) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message, context);
    console.log(formattedMessage);
    
    if (context?.data) {
      console.log('  Data:', context.data);
    }
  }

  info(message: string, context?: LogContext, force?: boolean): void {
    if (!this.shouldLog('info', force)) return;
    
    const formattedMessage = this.formatMessage('INFO', message, context);
    console.info(formattedMessage);
    
    if (context?.data) {
      console.info('  Data:', context.data);
    }
  }

  warn(message: string, context?: LogContext, force?: boolean): void {
    // Warnings siempre se muestran
    const formattedMessage = this.formatMessage('WARN', message, context);
    console.warn(formattedMessage);
    
    if (context?.data) {
      console.warn('  Data:', context.data);
    }
  }

  error(message: string, context?: LogContext, force?: boolean): void {
    // Errores siempre se muestran
    const formattedMessage = this.formatMessage('ERROR', message, context);
    console.error(formattedMessage);
    
    if (context?.data) {
      console.error('  Data:', context.data);
    }
  }

  // Métodos de conveniencia para componentes específicos
  component(componentName: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, { component: componentName, data }),
      info: (message: string, data?: any) => this.info(message, { component: componentName, data }),
      warn: (message: string, data?: any) => this.warn(message, { component: componentName, data }),
      error: (message: string, data?: any) => this.error(message, { component: componentName, data }),
    };
  }

  // Métodos de conveniencia para acciones específicas
  action(actionName: string) {
    return {
      debug: (message: string, data?: any) => this.debug(message, { action: actionName, data }),
      info: (message: string, data?: any) => this.info(message, { action: actionName, data }),
      warn: (message: string, data?: any) => this.warn(message, { action: actionName, data }),
      error: (message: string, data?: any) => this.error(message, { action: actionName, data }),
    };
  }

  // Método para logging de performance
  performance(operation: string, startTime: number, context?: LogContext): void {
    const duration = performance.now() - startTime;
    this.debug(`Performance: ${operation} took ${duration.toFixed(2)}ms`, context);
  }

  // Método para logging de estado
  state(component: string, stateName: string, oldState: any, newState: any): void {
    this.debug(`State change: ${stateName}`, {
      component,
      action: 'stateChange',
      data: { oldState, newState }
    });
  }

  // Método para logging de renderizado
  render(component: string, props?: any): void {
    this.debug(`Component rendered`, {
      component,
      action: 'render',
      data: props
    });
  }
}

// Instancia singleton del logger
export const logger = new Logger();

// Exportar métodos de conveniencia
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, context?: LogContext) => logger.error(message, context),
  
  // Métodos específicos para componentes comunes
  unifiedFlow: logger.component('UnifiedFlowWrapper'),
  bottomSheet: logger.component('GorhomMapFlowBottomSheet'),
  pagerView: logger.component('MapFlowPagerView'),
  registry: logger.component('StepRegistry'),
  
  // Métodos específicos para acciones comunes
  stepChange: logger.action('stepChange'),
  pageChange: logger.action('pageChange'),
  bottomSheetClose: logger.action('bottomSheetClose'),
  bottomSheetReopen: logger.action('bottomSheetReopen'),
  
  // Métodos de utilidad
  performance: logger.performance.bind(logger),
  state: logger.state.bind(logger),
  render: logger.render.bind(logger),
};

// Exportar el logger completo para casos avanzados
export default logger;