import React from 'react';
import { useFDC } from '../context/FDCContext';
import { DraggableWindow } from './DraggableWindow';
import { SystemSetupModule } from './modules/SystemSetupModule';
import { FOProcessingModule } from './modules/FOProcessingModule';
import { TargetListModule } from './modules/TargetListModule';
import { FiringTableModule } from './modules/FiringTableModule';
import { METMessageModule } from './modules/METMessageModule';
import { BasicGeometryModule } from './modules/BasicGeometryModule';
import { LinearInterpolationModule } from './modules/LinearInterpolationModule';
import { VectorSplittingModule } from './modules/VectorSplittingModule';
import { IndividualGunModule } from './modules/IndividualGunModule';
import { FiringLogAmmoModule } from './modules/FiringLogAmmoModule';
import { SpatialEngagementModule } from './modules/SpatialEngagementModule';
import { RegistrationModule } from './modules/RegistrationModule';
import { TacticalOverridesModule } from './modules/TacticalOverridesModule';
import { GeodeticModule } from './modules/GeodeticModule';

export const FDCDesktopManager: React.FC = () => {
  const { windows } = useFDC();

  const renderModuleContent = (windowId: string) => {
    switch (windowId) {
      case 'system_setup':
        return <SystemSetupModule />;
      case 'fo_processing':
        return <FOProcessingModule />;
      case 'target_list_db':
        return <TargetListModule />;
      case 'firing_table_integration':
        return <FiringTableModule />;
      case 'met_message_entry':
        return <METMessageModule />;
      case 'basic_geometry':
        return <BasicGeometryModule />;
      case 'linear_interpolation':
        return <LinearInterpolationModule />;
      case 'vector_splitting':
        return <VectorSplittingModule />;
      case 'individual_gun':
        return <IndividualGunModule />;
      case 'firing_log_ammo':
        return <FiringLogAmmoModule />;
      case 'spatial_engagement':
        return <SpatialEngagementModule />;
      case 'registration_radar':
        return <RegistrationModule />;
      case 'tactical_overrides':
        return <TacticalOverridesModule />;
      case 'geodetic_convergence':
        return <GeodeticModule />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mb-4"></span>
            <div className="text-emerald-400 font-mono text-sm">MODULE IN DEVELOPMENT</div>
            <div className="text-gray-500 text-xs mt-2">ID: {windowId}</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Container for desktop windows */}
      {windows.map(w => (
        <DraggableWindow key={w.id} window={w}>
          {renderModuleContent(w.id)}
        </DraggableWindow>
      ))}
    </div>
  );
};
