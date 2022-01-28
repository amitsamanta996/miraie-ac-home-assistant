# miraie-ac-home-assistant
Panasonic AC control from Home Assistant and Node Red (Miraie Panasonic)

Based on https://github.com/milothomas/ha-miraie-ac with added features to control swing and powerful mode.

Manual Installation Process:
* download all files and put on a folder named _package_
* (Optional) you can change the code if you know what you're doing
* use 7-zip to make tgz archive
    * in 7-zip first make archive using tar option
    * then select the tar file and make archive of the tar file and use gzip option
    * rename .tar.gz to .tgz
* open node red in home assistant and go to menu -> palletes -> install
* click upload icon there and select the tgz file and upload
* follow  _milothomas_ original repo for setup process in node red


NOTE: Home Assistant HVAC don't have powerful mode option, so using option heat instead of that, setting climate.hvac to heat will turn on powerful mode in the AC.

For UI use HACS library [simple thermostat](https://github.com/nervetattoo/simple-thermostat) and make a card using below yaml code

```yaml
type: custom:simple-thermostat
entity: climate.panasonic_ac
layout:
  mode:
    headings: false
    icons: true
    names: true
step_size: '1'
control:
  hvac:
    auto:
      name: false
    cool:
      name: false
    dry:
      name: false
    fan_only:
      name: false
    heat:
      name: false
      icon: mdi:snowflake-variant
    'off':
      name: false
  fan:
    auto:
      icon: mdi:fan-auto
      name: false
    low:
      icon: mdi:fan-speed-1
      name: false
    medium:
      icon: mdi:fan-speed-2
      name: false
    high:
      icon: mdi:fan-speed-3
      name: false
  swing:
    '0':
      icon: mdi:autorenew
      name: false
    '1':
      icon: mdi:arrow-left-thin
      name: false
    '2':
      icon: mdi:arrow-bottom-left-thin
      name: false
    '3':
      icon: mdi:arrow-down-thin
      name: false
    '4':
      icon: mdi:arrow-bottom-right-thin
      name: false
    '5':
      icon: mdi:arrow-right-thin
      name: false

```

<img width="428" alt="ac_ui" src="https://user-images.githubusercontent.com/93876251/151554889-ab9bd367-d1de-465f-9f20-c05e39be0f23.png">
