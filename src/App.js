import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [supportsBluetooth, setSupportsBluetooth] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(null);

  // When the component mounts, check that the browser supports Bluetooth
  useEffect(() => {
    if (navigator.bluetooth) {
      setSupportsBluetooth(true);
    }
  }, []);

  /**
   * Let the user know when their device has been disconnected.
   */
  const onDisconnected = (event) => {
    alert(`The device ${event.target} is disconnected`);
    setIsDisconnected(true);
  }

  /**
   * Update the value shown on the web page when a notification is
   * received.
   */
  const handleCharacteristicValueChanged = (event) => {
    setBatteryLevel(event.target.value.getUint8(0) + '%');
  }

  /**
   * Attempts to connect to a Bluetooth device and subscribe to
   * battery level readings using the battery service.
   */
  const connectTemperaturaDevice = async () => {
    try {
      // Procure dispositivos Bluetooth que anunciem o serviço de temperatura
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['00001809-0000-1000-8000-00805f9b34fb'] }] // Serviço de temperatura
      });
  
      console.log('Device:', device);
      console.log('Device ID:', device.id);
  
      setIsDisconnected(false);
  
      // Adicione um listener para desconexões
      device.addEventListener('gattserverdisconnected', onDisconnected);
  
      // Conecte-se ao servidor GATT do dispositivo
      const server = await device.gatt.connect();
  
      // Obtenha o serviço de temperatura
      const service = await server.getPrimaryService('00001809-0000-1000-8000-00805f9b34fb');
  
      // Obtenha a característica de medição de temperatura
      const characteristic = await service.getCharacteristic('00002a1c-0000-1000-8000-00805f9b34fb');
  
      // Ative as notificações para receber atualizações em tempo real
      characteristic.startNotifications();
  
      // Quando os dados de temperatura mudarem, atualize o log em tempo real
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
      
        // Exiba os dados brutos no console
        const rawData = [];
        for (let i = 0; i < value.byteLength; i++) {
          rawData.push(value.getUint8(i).toString(16).padStart(2, '0')); // Converte cada byte para hexadecimal
        }
        console.log('Raw Data:', rawData.join(' '));
      
        // Decodifique a temperatura
        try {
          const flags = value.getUint8(0); // Primeiro byte contém os flags
          const mantissa = (value.getUint8(3) << 16) | (value.getUint8(2) << 8) | value.getUint8(1); // 3 bytes para a mantissa
          const exponent = value.getInt8(4); // 1 byte para o expoente (com sinal)
      
          // Ajuste o complemento de dois, se necessário
          const adjustedMantissa = mantissa & 0xFFFFFF; // Remove bits extras
          const temperature = adjustedMantissa * Math.pow(10, exponent); // Calcula a temperatura
      
          console.log('Decoded Temperature:', temperature.toFixed(2), '°C');
          setBatteryLevel(`${temperature.toFixed(2)} °C`);
        } catch (error) {
          console.error('Error decoding temperature:', error);
        }
      });
  
      // Opcional: Leia o valor inicial da temperatura
      const reading = await characteristic.readValue();
      const initialTemperature = reading.getFloat32(1, true); // Ajuste conforme necessário
      console.log('Initial Temperature:', initialTemperature);
      setBatteryLevel(`${initialTemperature.toFixed(2)} °C`);
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  };

  const connectGtechService = async () => {
    try {
      // Procure dispositivos Bluetooth que anunciem o serviço de temperatura
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['00001800-0000-1000-8000-00805f9b34fb'] }] 
      });
  
      console.log('Device:', device);
      console.log('Device ID:', device.id);
  
      setIsDisconnected(false);
  
      // Adicione um listener para desconexões
      device.addEventListener('gattserverdisconnected', onDisconnected);
  
      // Conecte-se ao servidor GATT do dispositivo
      const server = await device.gatt.connect();
  
      // Obtenha o serviço de temperatura
      const service = await server.getPrimaryService('00001800-0000-1000-8000-00805f9b34fb');
  
      // Obtenha a característica de medição de temperatura
      const characteristic = await service.getCharacteristic('00002a00-0000-1000-8000-00805f9b34fb');
  
      // Ative as notificações para receber atualizações em tempo real
      characteristic.startNotifications();
  
      // Quando os dados de temperatura mudarem, atualize o log em tempo real
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
      
        // Exiba os dados brutos no console
        const rawData = [];
        for (let i = 0; i < value.byteLength; i++) {
          rawData.push(value.getUint8(i).toString(16).padStart(2, '0')); // Converte cada byte para hexadecimal
        }
        console.log('Raw Data:', rawData.join(' '));
      
        // Decodifique a temperatura
        try {
          const flags = value.getUint8(0); // Primeiro byte contém os flags
          const mantissa = (value.getUint8(3) << 16) | (value.getUint8(2) << 8) | value.getUint8(1); // 3 bytes para a mantissa
          const exponent = value.getInt8(4); // 1 byte para o expoente (com sinal)
      
          // Ajuste o complemento de dois, se necessário
          const adjustedMantissa = mantissa & 0xFFFFFF; // Remove bits extras
          const temperature = adjustedMantissa * Math.pow(10, exponent); // Calcula a temperatura
      
          console.log('Decoded Temperature:', temperature.toFixed(2), '°C');
          setBatteryLevel(`${temperature.toFixed(2)} °C`);
        } catch (error) {
          console.error('Error decoding temperature:', error);
        }
      });
  
      // Opcional: Leia o valor inicial da temperatura
      const reading = await characteristic.readValue();
      const initialTemperature = reading.getFloat32(1, true); // Ajuste conforme necessário
      console.log('Initial Temperature:', initialTemperature);
      setBatteryLevel(`${initialTemperature.toFixed(2)} °C`);
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  };

  const connectPressaoDevice = async () => {
    try {
      const serviceId = '00001809-0000-1000-8000-00805f9b34fb'; // Serviço de pressão
      const characteristicId = '00002a1c-0000-1000-8000-00805f9b34fb'; // Característica de pressão
      
      // Procure dispositivos Bluetooth que anunciem o serviço de temperatura
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceId] }] // Serviço de temperatura
      });
  
      console.log('Device:', device);
      console.log('Device ID:', device.id);
  
      setIsDisconnected(false);
  
      // Adicione um listener para desconexões
      device.addEventListener('gattserverdisconnected', onDisconnected);
  
      // Conecte-se ao servidor GATT do dispositivo
      const server = await device.gatt.connect();
      
      // Obtenha o serviço de temperatura
      const service = await server.getPrimaryService(serviceId);
  
      // Obtenha a característica de medição de temperatura
      const characteristic = await service.getCharacteristic(characteristicId);
  
      // Ative as notificações para receber atualizações em tempo real
      characteristic.startNotifications();
  
      // Quando os dados de temperatura mudarem, atualize o log em tempo real
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        console.log('value id', value)
        // Exiba os dados brutos no console
        const rawData = [];
        for (let i = 0; i < value.byteLength; i++) {
          rawData.push(value.getUint8(i).toString(16).padStart(2, '0')); // Converte cada byte para hexadecimal
        }

        console.log('Raw Data:', rawData.join(' '));
      
        // Decodifique a temperatura
        try {
          const flags = value.getUint8(0); // Primeiro byte contém os flags
          const mantissa = (value.getUint8(3) << 16) | (value.getUint8(2) << 8) | value.getUint8(1); // 3 bytes para a mantissa
          const exponent = value.getInt8(4); // 1 byte para o expoente (com sinal)
      
          // Ajuste o complemento de dois, se necessário
          const adjustedMantissa = mantissa & 0xFFFFFF; // Remove bits extras
          const temperature = adjustedMantissa * Math.pow(10, exponent); // Calcula a temperatura
      
          console.log('Decoded Temperature:', temperature.toFixed(2), '°C');
          setBatteryLevel(`${temperature.toFixed(2)} °C`);
        } catch (error) { 
          console.error('Error decoding temperature:', error);
        }
      });
  
      
    } catch (error) {
      console.error(`There was an error: ${error}`);
    }
  };

  const testAllServicesAndCharacteristics = async () => {
    try {
      const uuids = [
        "00002a7e-0000-1000-8000-00805f9b34fb",
        "00002a84-0000-1000-8000-00805f9b34fb",
        "00002a7f-0000-1000-8000-00805f9b34fb",
        "00002a80-0000-1000-8000-00805f9b34fb",
        "00002a5a-0000-1000-8000-00805f9b34fb",
        "00002a43-0000-1000-8000-00805f9b34fb",
        "00002a42-0000-1000-8000-00805f9b34fb",
        "00002a06-0000-1000-8000-00805f9b34fb",
        "00002a44-0000-1000-8000-00805f9b34fb",
        "00002a3f-0000-1000-8000-00805f9b34fb",
        "00002ab3-0000-1000-8000-00805f9b34fb",
        "00002a81-0000-1000-8000-00805f9b34fb",
        "00002a82-0000-1000-8000-00805f9b34fb",
        "00002a83-0000-1000-8000-00805f9b34fb",
        "00002a58-0000-1000-8000-00805f9b34fb",
        "00002a73-0000-1000-8000-00805f9b34fb",
        "00002a72-0000-1000-8000-00805f9b34fb",
        "00002a01-0000-1000-8000-00805f9b34fb",
        "00002aa3-0000-1000-8000-00805f9b34fb",
        "00002a19-0000-1000-8000-00805f9b34fb",
        "00002a49-0000-1000-8000-00805f9b34fb",
        "00002a35-0000-1000-8000-00805f9b34fb",
        "00002a9b-0000-1000-8000-00805f9b34fb",
        "00002a9c-0000-1000-8000-00805f9b34fb",
        "00002a38-0000-1000-8000-00805f9b34fb",
        "00002aa4-0000-1000-8000-00805f9b34fb",
        "00002aa5-0000-1000-8000-00805f9b34fb",
        "00002a22-0000-1000-8000-00805f9b34fb",
        "00002a32-0000-1000-8000-00805f9b34fb",
        "00002a33-0000-1000-8000-00805f9b34fb",
        "00002aa6-0000-1000-8000-00805f9b34fb",
        "00002aa8-0000-1000-8000-00805f9b34fb",
        "00002aa7-0000-1000-8000-00805f9b34fb",
        "00002aab-0000-1000-8000-00805f9b34fb",
        "00002aaa-0000-1000-8000-00805f9b34fb",
        "00002aac-0000-1000-8000-00805f9b34fb",
        "00002aa9-0000-1000-8000-00805f9b34fb",
        "00002a5c-0000-1000-8000-00805f9b34fb",
        "00002a5b-0000-1000-8000-00805f9b34fb",
        "00002a2b-0000-1000-8000-00805f9b34fb",
        "00002a66-0000-1000-8000-00805f9b34fb",
        "00002a65-0000-1000-8000-00805f9b34fb",
        "00002a63-0000-1000-8000-00805f9b34fb",
        "00002a64-0000-1000-8000-00805f9b34fb",
        "00002a99-0000-1000-8000-00805f9b34fb",
        "00002a85-0000-1000-8000-00805f9b34fb",
        "00002a86-0000-1000-8000-00805f9b34fb",
        "00002a08-0000-1000-8000-00805f9b34fb",
        "00002a0a-0000-1000-8000-00805f9b34fb",
        "00002a09-0000-1000-8000-00805f9b34fb",
        "00002a7d-0000-1000-8000-00805f9b34fb",
        "00002a00-0000-1000-8000-00805f9b34fb",
      ];

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: uuids,
      });

      console.log("Device:", device);
      const server = await device.gatt.connect();
      console.log("Connected to GATT Server");

      for (const uuid of uuids) {
        try {
          const service = await server.getPrimaryService(uuid);
          console.log(`Service found: ${uuid}`);
          const characteristics = await service.getCharacteristics();
          for (const characteristic of characteristics) {
            console.log(`  Characteristic found: ${characteristic.uuid}`);
          }
        } catch (error) {
          console.log(`Service not found: ${uuid}`);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const connectToDeviceAndLogServices = async () => {
    try {
      const serviceId = '000002902-0000-1000-8000-00805f9b34fb';
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Accept all devices without filtering by service
        //optionalServices: [serviceId] // Specify the service you want to connect to
      });
      console.log(device);
      console.log('Device:', device.name);
  
      const server = await device.gatt.connect();
      console.log('Connected to GATT Server:', server);
      const services = await server.getPrimaryServices('00001800-0000-1000-8000-00805f9b34fb');
  
      for (const service of services) {
        console.log(`Service: ${service.uuid}`);
  
        const characteristics = await service.getCharacteristics();
        for (const characteristic of characteristics) {
          console.log(`  Characteristic: ${characteristic.uuid}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      {supportsBluetooth && !isDisconnected &&
            <p>Value: {batteryLevel}</p>
      }
      {supportsBluetooth && isDisconnected &&
        <button onClick={connectTemperaturaDevice}>Conecte ao dispositivo de temperatura</button>
      }
      {supportsBluetooth && isDisconnected &&
        <button onClick={testAllServicesAndCharacteristics}>Conecte ao dispositivo ECG</button>
      }
      {supportsBluetooth && isDisconnected &&
        <button onClick={connectGtechService}>Conecte ao dispositivo de glicose</button>
      }
      {!supportsBluetooth &&
        <p>This browser doesn't support the Web Bluetooth API</p>
      }
    </div>
  );
}

export default App;
