
module.exports = Discovery;

const generateConfigPayload = (device) => {
    const deviceName = device.name;
    const stateTopic = `/ac/${deviceName}/status`;

    return {
        name: device.friendlyName,
        unique_id: deviceName,
        mode_cmd_t: `/ac/${deviceName}/mode/set`,
        mode_stat_t: `/ac/${deviceName}/mode/update`,
       
        avty_t: `/ac/${deviceName}/availability`,       //copy of connectionstatus
        avty_tpl: "{{ value_json.onlineStatus }}",
        pl_avail: "true",
        pl_not_avail: "false",
        
        temp_cmd_t: `/ac/${deviceName}/temp/set`,
        temp_stat_t: stateTopic,
        temp_stat_tpl: "{{ value_json.actmp }}",
        
        curr_temp_t: stateTopic,
        curr_temp_tpl: "{{ value_json.rmtmp }}",
        
        max_temp: "30",
        min_temp: "16",
        
        fan_mode_cmd_t: `/ac/${deviceName}/fan/set`,    //ha response on fan change
        fan_mode_stat_t: stateTopic,                    //ha set fan
        fan_mode_stat_tpl: "{{ value_json.acfs }}",

        swing_mode_cmd_t: `/ac/${deviceName}/swing/set`,    //ha response on swing change
        swing_mode_stat_t: stateTopic,                    //ha set swing
        swing_mode_stat_tpl: "{{ value_json.acvs }}",
        
        modes: ["auto", "cool", "heat", "dry", "fan_only", "off"],
        fan_modes: ["auto", "low", "medium", "high"],
        swing_modes: [0, 1, 2, 3, 4, 5],
        temperature_unit: "C",
        temp_step: 1
    };
}

function Discovery() {}

Discovery.prototype.generateDiscoMessage = function (device) {
    return {
        topic: `homeassistant/climate/${device.name}/config`,
        payload: generateConfigPayload(device),
    }
}