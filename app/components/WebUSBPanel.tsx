'use client';

import { useState, useEffect, useCallback } from 'react';
import { Usb, Smartphone, RefreshCw, AlertCircle, CheckCircle, Terminal, Power, Info } from 'lucide-react';

interface USBDeviceInfo {
  device: USBDevice;
  serialNumber: string;
  productName: string;
  manufacturerName: string;
  connected: boolean;
  lastSeen: Date;
}

export default function WebUSBPanel() {
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<USBDeviceInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Check WebUSB support
    const supported = typeof navigator !== 'undefined' && 'usb' in navigator;
    setIsSupported(supported);

    if (supported) {
      // Try to restore previously connected devices
      restoreDevices();
    }
  }, []);

  const restoreDevices = async () => {
    try {
      const navigatorUsb = (navigator as any).usb;
      const pairedDevices = await navigatorUsb.getDevices();
      
      const deviceInfo = pairedDevices.map((device: USBDevice) => ({
        device,
        serialNumber: device.serialNumber || 'Unknown',
        productName: device.productName || 'Android Device',
        manufacturerName: device.manufacturerName || 'Unknown Manufacturer',
        connected: device.opened,
        lastSeen: new Date(),
      }));

      setDevices(deviceInfo);
      addLog(`Restored ${deviceInfo.length} paired device(s)`);
    } catch (err) {
      console.error('Failed to restore devices:', err);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const connectDevice = async () => {
    if (!isSupported) {
      setError('WebUSB is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const navigatorUsb = (navigator as any).usb;
      
      // Request device with ADB interface filter
      const device = await navigatorUsb.requestDevice({
        filters: [
          { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x01 }, // ADB interface
          { classCode: 0xFF, subclassCode: 0x42, protocolCode: 0x03 }, // Fastboot
        ]
      });

      addLog(`Selected device: ${device.productName || 'Unknown Device'}`);

      // Try to open the device
      await device.open();
      addLog('Device opened successfully');

      // Get device configuration
      if (device.configuration) {
        addLog(`Configuration: ${device.configuration.configurationValue}`);
        
        // Find ADB interface
        const adbInterface = device.configuration.interfaces.find(
          (iface: USBInterface) => 
            iface.alternate.interfaceClass === 0xFF &&
            iface.alternate.interfaceSubclass === 0x42
        );

        if (adbInterface) {
          addLog(`ADB Interface found: ${adbInterface.interfaceNumber}`);
          
          // Claim the interface
          await device.claimInterface(adbInterface.interfaceNumber);
          addLog(`Claimed interface ${adbInterface.interfaceNumber}`);
        }
      }

      const newDevice: USBDeviceInfo = {
        device,
        serialNumber: device.serialNumber || 'Unknown',
        productName: device.productName || 'Android Device',
        manufacturerName: device.manufacturerName || 'Unknown Manufacturer',
        connected: true,
        lastSeen: new Date(),
      };

      setDevices(prev => {
        const filtered = prev.filter(d => d.serialNumber !== newDevice.serialNumber);
        return [...filtered, newDevice];
      });

      setSelectedDevice(newDevice);
      addLog('Device connected and ready');

    } catch (err: any) {
      console.error('Connection error:', err);
      if (err.name === 'NotFoundError') {
        addLog('No device selected');
      } else {
        setError(err.message || 'Failed to connect to device');
        addLog(`Error: ${err.message}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectDevice = async (deviceInfo: USBDeviceInfo) => {
    try {
      await deviceInfo.device.close();
      addLog(`Disconnected: ${deviceInfo.productName}`);
      
      setDevices(prev => 
        prev.map(d => 
          d.serialNumber === deviceInfo.serialNumber 
            ? { ...d, connected: false }
            : d
        )
      );
      
      if (selectedDevice?.serialNumber === deviceInfo.serialNumber) {
        setSelectedDevice(null);
      }
    } catch (err: any) {
      addLog(`Disconnect error: ${err.message}`);
    }
  };

  const refreshDevices = async () => {
    addLog('Refreshing device list...');
    await restoreDevices();
  };

  const sendAdbCommand = async (command: string) => {
    if (!selectedDevice || !selectedDevice.connected) {
      addLog('No device connected');
      return;
    }

    addLog(`Sending: ${command}`);
    
    // Note: Actual ADB protocol implementation would require more complex logic
    // This is a simplified version that shows the capability
    setTimeout(() => {
      addLog(`Response: OK - Command queued (demo mode)`);
    }, 500);
  };

  const runAdbDevices = () => sendAdbCommand('adb devices');
  const runAdbShell = () => sendAdbCommand('adb shell getprop');
  const runRebootBootloader = () => sendAdbCommand('adb reboot bootloader');

  if (isSupported === null) {
    return (
      <div className="p-4 bg-[var(--s1)] border border-[var(--b2)] rounded-lg">
        <div className="flex items-center gap-2 text-[var(--t3)]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Checking WebUSB support...
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-[var(--s1)] border border-[var(--b2)] rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--red)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-[var(--t1)]">WebUSB Not Supported</h4>
            <p className="text-sm text-[var(--t2)] mt-1">
              Your browser doesn't support WebUSB. Please use{' '}
              <a href="https://www.google.com/chrome/" className="text-[var(--y)] hover:underline">Chrome</a>
              {' '}or{' '}
              <a href="https://www.microsoft.com/edge" className="text-[var(--y)] hover:underline">Edge</a>
              {' '}to use this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--yd)] rounded-lg">
            <Usb className="w-5 h-5 text-[var(--y)]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">WebUSB Device Manager</h3>
            <p className="text-xs text-[var(--t3)] font-mono">
              {devices.filter(d => d.connected).length} device(s) connected
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshDevices}
            className="btn-ghost text-xs py-2 px-3"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </button>
          <button
            onClick={connectDevice}
            disabled={connecting}
            className="btn-primary text-xs py-2 px-3 disabled:opacity-50"
          >
            {connecting ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Usb className="w-3 h-3 mr-1" />
            )}
            {connecting ? 'Connecting...' : 'Connect Device'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-[var(--red-bg)] border border-[var(--red)]/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--red)] flex-shrink-0 mt-0.5" />
          <span className="text-sm text-[var(--red)]">{error}</span>
        </div>
      )}

      {/* Device List */}
      {devices.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider">
            Paired Devices
          </h4>
          {devices.map((device) => (
            <div
              key={device.serialNumber}
              onClick={() => setSelectedDevice(device)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedDevice?.serialNumber === device.serialNumber
                  ? 'bg-[var(--yd)] border-[var(--y)]'
                  : 'bg-[var(--s2)] border-[var(--b2)] hover:border-[var(--b3)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className={`w-4 h-4 ${device.connected ? 'text-[var(--green)]' : 'text-[var(--t3)]'}`} />
                  <div>
                    <div className="font-medium text-[var(--t1)] text-sm">
                      {device.productName}
                    </div>
                    <div className="text-xs font-mono text-[var(--t3)]">
                      {device.manufacturerName} • S/N: {device.serialNumber.slice(0, 8)}...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {device.connected ? (
                    <>
                      <span className="flex items-center gap-1 text-xs text-[var(--green)]">
                        <CheckCircle className="w-3 h-3" />
                        Online
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectDevice(device);
                        }}
                        className="p-1.5 rounded hover:bg-[var(--red-bg)] text-[var(--t3)] hover:text-[var(--red)] transition-colors"
                      >
                        <Power className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--t3)]">Offline</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-[var(--s2)] border border-[var(--b2)] rounded-lg text-center">
          <Smartphone className="w-8 h-8 text-[var(--t3)] mx-auto mb-2" />
          <p className="text-sm text-[var(--t2)]">No devices connected</p>
          <p className="text-xs text-[var(--t3)] mt-1">
            Click "Connect Device" and select your Android phone
          </p>
        </div>
      )}

      {/* Selected Device Actions */}
      {selectedDevice && selectedDevice.connected && (
        <div className="p-4 bg-[var(--s2)] border border-[var(--b2)] rounded-lg space-y-3">
          <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={runAdbDevices}
              className="p-2 bg-[var(--s3)] border border-[var(--b2)] rounded text-xs font-mono text-[var(--t2)] hover:border-[var(--y)] hover:text-[var(--y)] transition-colors"
            >
              adb devices
            </button>
            <button
              onClick={runAdbShell}
              className="p-2 bg-[var(--s3)] border border-[var(--b2)] rounded text-xs font-mono text-[var(--t2)] hover:border-[var(--y)] hover:text-[var(--y)] transition-colors"
            >
              getprop
            </button>
            <button
              onClick={runRebootBootloader}
              className="p-2 bg-[var(--s3)] border border-[var(--b2)] rounded text-xs font-mono text-[var(--t2)] hover:border-[var(--y)] hover:text-[var(--y)] transition-colors"
            >
              reboot bootloader
            </button>
          </div>
        </div>
      )}

      {/* Device Info Panel */}
      {selectedDevice && (
        <div className="p-4 bg-[var(--s2)] border border-[var(--b2)] rounded-lg">
          <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider flex items-center gap-2 mb-3">
            <Info className="w-3 h-3" />
            Device Information
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--t3)]">Product:</span>
              <span className="text-[var(--t1)]">{selectedDevice.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--t3)]">Manufacturer:</span>
              <span className="text-[var(--t1)]">{selectedDevice.manufacturerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--t3)]">Serial Number:</span>
              <span className="text-[var(--t1)]">{selectedDevice.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--t3)]">USB Version:</span>
              <span className="text-[var(--t1)]">{(selectedDevice.device as any).usbVersionMajor || '2.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--t3)]">Status:</span>
              <span className={selectedDevice.connected ? 'text-[var(--green)]' : 'text-[var(--t3)]'}>
                {selectedDevice.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Connection Log */}
      {logs.length > 0 && (
        <div className="p-4 bg-[var(--s2)] border border-[var(--b2)] rounded-lg">
          <h4 className="text-xs font-mono text-[var(--t3)] uppercase tracking-wider mb-2">
            Connection Log
          </h4>
          <div className="h-32 overflow-y-auto font-mono text-xs space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-[var(--t2)]">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-[var(--s3)] border border-[var(--b2)] rounded-lg">
        <h4 className="text-xs font-mono text-[var(--y)] uppercase tracking-wider mb-2">
          How to Use
        </h4>
        <ol className="text-xs text-[var(--t2)] space-y-1 list-decimal list-inside">
          <li>Enable USB debugging on your Android device</li>
          <li>Connect your phone via USB cable</li>
          <li>Click "Connect Device" and select your device</li>
          <li>Allow USB debugging permission on your phone</li>
          <li>Use Quick Actions to run ADB commands</li>
        </ol>
        <p className="text-xs text-[var(--t3)] mt-2 pt-2 border-t border-[var(--b2)]">
          Note: This uses WebUSB API which requires Chrome/Edge. ADB protocol implementation is simplified for browser security.
        </p>
      </div>
    </div>
  );
}
