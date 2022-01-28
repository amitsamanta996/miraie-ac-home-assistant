const MqttHelper = require('./mqtt-helper');
const Discovery = require('./discovery');

let mqttHelper;
let mqttDisco;
let topics;
let discoveredDevices;
let onCmdReceivedCallback;

const publishMessage = (topic, payload) => {
    mqttHelper.publish(topic, payload, 0, true, onPublishCompleted);
};

const publishDisoveryMessages = () => {
    discoveredDevices.map(d => {
        const msg = mqttDisco.generateDiscoMessage(d);
        publishMessage(msg.topic, msg.payload);
    });
};

const onConnected = () => {
    publishDisoveryMessages();
    mqttHelper.subscribe(topics, { qos: 0 });
};

const onMessageReceieved = (topic, payload) => {
    if (onCmdReceivedCallback) {
        onCmdReceivedCallback(topic, payload);
    }
};

const onPublishCompleted = (e) => {
    if (e) {
        console.error('Error publishing message to HA. ' + e);
    }
}


const generateMessages = (device, state, availCheck) => {
    let topic;
    if(availCheck){
        topic = device.haAvailabilityTopic;
        const msg = {
            topic: topic,
            payload: state
        };
    
        return [msg];
    }else{
        topic = device.haStatusTopic;
        modeT = device.haModeTopic;
        sdata = JSON.parse(state);
        let mode = sdata.acmd;
        if(sdata.ps == 'off'){
            mode = 'off';
        }else if(sdata.acpm == "on"){
            mode = "heat";
        }else if(sdata.acmd == "fan"){
            mode = "fan_only";
        }

        const msg = {
            topic: topic,
            payload: state
        };

        const modeMsg = {
            topic: modeT,
            payload: mode
        };
    
        return [msg, modeMsg];
    }
    
    
}

module.exports = HABroker;

function HABroker(devices, onCmdReceieved) {
    mqttHelper = new MqttHelper();
    mqttDisco = new Discovery();

    discoveredDevices = devices;
    topics = devices.map(d => d.haCommandTopic);
    onCmdReceivedCallback = onCmdReceieved;
}

HABroker.prototype.connect = function (settings) {
    const clientId = 'node-red-ha-miraie-ac-node-amit';
    mqttHelper.connect(settings.haBrokerHost, settings.haBrokerPort, clientId, settings.useSsl, settings.haBrokerUsername, settings.haBrokerPassword, settings.useCleanSession, onConnected, onMessageReceieved);
};

HABroker.prototype.publish = function (device, state, availCheck = false) {
    const messages = generateMessages(device, state, availCheck);
    messages.map(m => publishMessage(m.topic, m.payload));
};