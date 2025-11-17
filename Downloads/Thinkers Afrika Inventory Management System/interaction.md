# TIMS Interaction Design Document

## Core Interactive Components

### 1. Real-Time Dashboard KPI Cards
**Primary Interaction**: Hover and click states with smooth animations
- **Visual**: Large glassmorphic cards with current stock levels, weekly consumption, monthly trends
- **Behavior**: On hover, cards elevate with 240ms smooth transition and show additional detail tooltips
- **Data**: Live updating numbers with animated counters, color-coded status indicators (Green/Amber/Red)
- **Multi-turn Loop**: Click cards to drill down into detailed analytics views

### 2. Stock Intake Modal System
**Primary Interaction**: Multi-step form with real-time calculations
- **Visual**: Cinematic glass-effect modal overlay with step-based progression
- **Behavior**: 
  - Step 1: Product ID entry with auto-detection and duplicate warnings
  - Step 2: Quantity and cost inputs with live selling price calculation
  - Step 3: Confirmation with animated stock level preview
- **Smart Features**: Auto-complete product categories, intelligent unit formatting, real-time validation
- **Multi-turn Loop**: Success state allows immediate addition of another product or viewing updated dashboard

### 3. Consumption Logging Interface
**Primary Interaction**: Dual-tab consumption tracker with quick actions
- **Visual**: Clean tabbed interface (Thinkers Internal / External Clients)
- **Behavior**:
  - Tab switching with smooth slide transitions
  - Product selection with intelligent autocomplete
  - Quantity input with remaining stock auto-calculation
  - Consumer selection with logo placeholders for external companies
- **Smart Features**: Usage anomaly detection, instant stock updates, consumption timeline visualization
- **Multi-turn Loop**: Quick duplicate entry, adjust previous entries, export consumption reports

### 4. Intelligent Global Search
**Primary Interaction**: Real-time search with advanced filtering
- **Visual**: Prominent search bar with expanding results dropdown
- **Behavior**: 
  - Instant search across product IDs, descriptions, categories
  - Filter by cost ranges, stock levels, consumption history
  - Keyboard navigation support
- **Smart Features**: Search suggestions, recent searches, saved search filters
- **Multi-turn Loop**: Search results lead to detailed product views with action buttons

### 5. Interactive Data Visualizations
**Primary Interaction**: Hover, click, and drill-down capabilities
- **Visual**: Area charts for stock vs usage, timeline visualizations, pie charts for category breakdown
- **Behavior**:
  - Hover reveals detailed data points with smooth tooltips
  - Click segments to filter data across the entire dashboard
  - Smooth animated transitions between time periods
- **Multi-turn Loop**: Chart interactions update all related dashboard components

### 6. Alert Management System
**Primary Interaction**: Notification center with action buttons
- **Visual**: Premium notification toasts with glassmorphic styling
- **Behavior**:
  - Low stock alerts with direct reorder actions
  - Critical depletion warnings with emergency contact options
  - Consumption spike notifications with investigation links
- **Smart Features**: Alert prioritization, bulk actions, custom alert thresholds
- **Multi-turn Loop**: Alert actions lead to relevant management interfaces

## User Flow Architecture

### Primary User Journey: Stock Management
1. **Dashboard Overview**: User sees real-time stock status with visual indicators
2. **Low Stock Alert**: System highlights products needing attention
3. **Add Stock Action**: User initiates stock intake through floating action button
4. **Modal Workflow**: Multi-step form guides through product addition
5. **Real-time Updates**: Dashboard reflects new stock levels with animations
6. **Confirmation Flow**: Success state with options for additional actions

### Secondary User Journey: Consumption Tracking
1. **Consumption Dashboard**: User views recent usage patterns and trends
2. **Log Consumption**: Quick access to consumption logging interface
3. **Product Selection**: Intelligent autocomplete guides product choice
4. **Quantity Entry**: Real-time stock calculation and validation
5. **Consumer Assignment**: Internal vs external tracking with company selection
6. **Analytics Update**: Consumption data reflects across all visualizations

### Tertiary User Journey: Analytics and Reporting
1. **Chart Interaction**: User explores data through interactive visualizations
2. **Filter Application**: Dynamic filtering across time periods and categories
3. **Search Integration**: Global search for specific product insights
4. **Export Actions**: Generate professional PDF/CSV reports
5. **Alert Configuration**: Set custom thresholds and notification preferences

## Interactive Data Requirements

### Mock Data Sets
- **Products**: 50+ lubricant and consumable items with realistic SKUs, descriptions, categories
- **Stock History**: 6 months of stock intake and consumption data for trend analysis
- **Client Data**: 15+ external companies with logos and consumption patterns
- **Alert Scenarios**: Multiple alert types (low stock, critical, anomalies) for demonstration

### Real-time Calculations
- Stock level updates with animated counters
- Cost and selling price calculations with markup application
- Consumption trend calculations with predictive indicators
- Profitability metrics with real-time updates

## Accessibility and Responsive Design
- Keyboard navigation support for all interactive elements
- Touch-friendly interfaces for mobile consumption logging
- Screen reader compatible alert notifications
- Responsive grid layouts that adapt to screen sizes
- High contrast mode support for accessibility compliance