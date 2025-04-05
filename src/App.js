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
        <button onClick={connectToDeviceAndLogServices}>Conecte ao dispositivo de pressão</button>
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
