# 2D Localization Simulator

This is a framework that should make it easier to prototype localization algorithms.

If everything goes right, the user should only modify the methods in the ./js/experimentalAPI folder.

This simulator is configured using 4 JSON files in the ./config folder.

When you start the GUI, you can create rooms by clicking the corners. In order to do this, you have to have a rooms.json with at least the room ids like so:

```js
{
  "room-1":{},
  "room-2":{},
  "room-3":{},
  "room-4":{},
  "room-5":{},
  "room-6":{},
  "room-7":{}
}
```

Then, on reload, the gui will let you draw the walls on the grid (darker lines are 1 meter). When you're done, press the print to console button to print the new JSON in your developer console. Copy this into rooms.json an it's stored!

You can place Crownstones, place them where you want, then press print to console and copy the data into your stones.json.

You can set the training points per room. Do your thing, press print to console and copy the data into your trainingLocations.json.

Now you can use the last 2 options.

Enjoy.

# License

## Open-source license

This software is provided under a noncontagious open-source license towards the open-source community. It's available under three open-source licenses:
 
* License: LGPL v3+, Apache, MIT

<p align="center">
  <a href="http://www.gnu.org/licenses/lgpl-3.0">
    <img src="https://img.shields.io/badge/License-LGPL%20v3-blue.svg" alt="License: LGPL v3" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License: Apache 2.0" />
  </a>
</p>

## Commercial license

This software can also be provided under a commercial license. If you are not an open-source developer or are not planning to release adaptations to the code under one or multiple of the mentioned licenses, contact us to obtain a commercial license.

* License: Crownstone commercial license

# Contact

For any question contact us at <https://crownstone.rocks/contact/> or on our discord server through <https://crownstone.rocks/forum/>.
