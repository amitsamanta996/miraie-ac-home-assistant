const MqttHelper = require('./mqtt-helper');

let mqttHelper;
let topics;
let onStateChangedCallback;

const CMD_TYPES = {
    MODE: 'mode',
    TEMPERATURE: 'temp',
    FAN: 'fan',
    SWING: 'swing'
};

const generateRandomNumber = (len) => Math.floor(Math.random() * Math.pow(10, len));

const generateClientId = () => `an${generateRandomNumber(16)}${generateRandomNumber(5)}`;

const onConnected = () => {
    mqttHelper.subscribe(topics, { qos: 0 });
}

const onMessageReceieved = (topic, payload) => {
    if (onStateChangedCallback) {
        onStateChangedCallback(topic, payload);
    }
};

const onPublishCompleted = (e) => {
    if (e) {
        console.error('Error publishing message to MirAIe. ' + e);
    }
}

const buildBasePayload = (device) => {
    return {
        "ki": 1,
        "cnt": "an",
        "sid": "1"
    };
};

const getCommandType = topic => {
    if (topic.endsWith('/mode/set')) {
        return CMD_TYPES.MODE;
    }

    if (topic.endsWith('/temp/set')) {
        return CMD_TYPES.TEMPERATURE;
    }

    if (topic.endsWith('/fan/set')) {
        return CMD_TYPES.FAN;
    }

    if (topic.endsWith('/swing/set')) {
        return CMD_TYPES.SWING;
    }
};

const generateModeMessages = (basePayload, command, topic) => {
    if(command == "fan_only"){
        command = "fan";
    }
    let powerMsg;
    if(command == "off"){
        powerMsg = {
            topic,
            payload: {
                ...basePayload,
                ps: "off"
            }
        };
        return [powerMsg];
    }else{
        powerMsg = {
            topic,
            payload: {
                ...basePayload,
                ps: "on"
            }
        };
        
        
        if(command == "heat"){
            const modeMessage = {
                topic,
                payload: {
                    ...basePayload,
                    acmd: "cool"
                }
            };
            const powerfulMessage = {
                topic,
                payload: {
                    ...basePayload,
                    acpm: "on"
                }
            };
            return [powerMsg, modeMessage, powerfulMessage];
        }else{
            const modeMessage = {
                topic,
                payload: {
                    ...basePayload,
                    acmd: command
                }
            };
            return [powerMsg, modeMessage];
        }
        
    }

}

const generateTemperatureMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            "actmp": command
        }
    }];
};

const generateFanMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acfs: command
        }
    }];
};

const generateSwingMessage = (basePayload, command, topic) => {
    return [{
        topic,
        payload: {
            ...basePayload,
            acvs: parseInt(command)
        }
    }];
};

const generateMessages = (topic, command, cmdType, basePayload) => {
    switch (cmdType) {
        case CMD_TYPES.MODE:
            return generateModeMessages(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.TEMPERATURE:
            return generateTemperatureMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.FAN:
            return generateFanMessage(basePayload, command.toLowerCase(), topic);
        case CMD_TYPES.SWING:
            return generateSwingMessage(basePayload, command.toLowerCase(), topic);
    }
    return [];
};

module.exports = MiraieBroker;

function MiraieBroker(devices, onStateChanged) {
    const miraieStatusTopics = devices.map(d => d.statusTopic);
    const miraieAvailTopics = devices.map(d => d.availabilityTopic);

    mqttHelper = new MqttHelper();
    topics = miraieStatusTopics.concat(miraieAvailTopics);
    onStateChangedCallback = onStateChanged;
}

MiraieBroker.prototype.connect = function (constants, username, password) {
    const clientId = generateClientId();
    const useSsl = 'true';
    mqttHelper.connect(constants.mirAIeBrokerHost, constants.mirAIeBrokerPort, clientId, useSsl, username, password, false, onConnected, onMessageReceieved);
};

MiraieBroker.prototype.publish = function (device, command, commandTopic) {
    const basePayload = buildBasePayload(device);
    const cmdType = getCommandType(commandTopic);
    const messages = generateMessages(device.controlTopic, command, cmdType, basePayload);
    messages.map(m => mqttHelper.publish(m.topic, m.payload, 0, false, onPublishCompleted));
};