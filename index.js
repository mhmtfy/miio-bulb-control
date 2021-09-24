const miio = require("miio-api");
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const devices = [
    {
        address: '192.168.1.33',
        token: 'f61233a1ebf2f02ede87b3017f585152'
    },
    {
        address: '192.168.1.34',
        token: 'ccce295b1f24e22c2f2968dbb10662e8'
    }
]

const getPowerState = async (device) => {
    const state = await device.call("get_prop", ["power"])
    return state[0]
}

const toggleLight = async (device) => {
    const state = await getPowerState(device)
    await device.call("set_power", [state === "on" ? "off" : "on"])
}

const openLight = async (device) => {
    await device.call("set_power", ["on"])
}

const closeLight = async (device) => {
    await device.call("set_power", ["off"])
}

const getBrightness = async (device) => {
    const state = await device.call("get_prop", ["bright"])
    return state[0]
}

const setBrightness = async (device, brightness) => {
    await device.call("set_bright", [brightness]) // 1 - 100
}

const getRGB = async (device) => {
    const state = await device.call("get_prop", ["rgb"])
    return state[0]
}

const setRGB = async (device, color) => {
    // sudden -> Directly Set
    // smooth -> Smooth Set
    await device.call("set_rgb", [color, 'sudden', 1000])
}

const randomRGB = async = () => {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return {r, g, b}
}

const RGBtoCode = ({r, g, b}) => {
    return r * 65536 + g * 256 + b;
}

const toggleLights = async () => {
    for (let device of devices) {
        try {
            device = await miio.device({
                address: device.address,
                token: device.token
            });

            await toggleLight(device)
            // await openLight(device)
            // await closeLight(device)
            // await setBrightness(device, 100)
            // await getBrightness(device)
            // const color = RGBtoCode(randomRGB())
            // await setRGB(device, color)
        } catch (err) {
            console.error("ERROR: " + err);
        } finally {
            if (device) {
                device.destroy();
            }
        }
    }
}

let interval = undefined;

const surfRGB = async () => {
    if (typeof interval !== 'undefined') {
        stopInterval()
        return
    }
    interval = setInterval(async () => {
        const color = RGBtoCode(randomRGB())
        for (let device of devices) {
            try {
                device = await miio.device({
                    address: device.address,
                    token: device.token
                });
                await setRGB(device, color)
            } catch (err) {
                console.error("ERROR: " + err);
            } finally {
                if (device) {
                    device.destroy();
                }
            }
        }
    }, 250)
}

const stopInterval = () => {
    if (typeof interval !== 'undefined') {
        clearInterval(interval)
        interval = undefined
    }
}

const whiteLed = async () => {
    stopInterval()

    const color = RGBtoCode({r: 255, g: 255, b: 255})
    for (let device of devices) {
        try {
            device = await miio.device({
                address: device.address,
                token: device.token
            });
            await setRGB(device, color)
        } catch (err) {
            console.error("ERROR: " + err);
        } finally {
            if (device) {
                device.destroy();
            }
        }
    }
}

const brightness = async (energy) => {
    for (let device of devices) {
        try {
            device = await miio.device({
                address: device.address,
                token: device.token
            });
            await setBrightness(device, energy)
        } catch (err) {
            console.error("ERROR: " + err);
        } finally {
            if (device) {
                device.destroy();
            }
        }
    }
}

const main = () => {
    rl.question('1 - Toggle Light\n2 - Disco Light\n3 - White Led\n4 - Brigtness Full\n5 - Brightness Low\n-> ', async (selected) => {
        switch (selected) {
            case '1':
                await toggleLights();
                break;
            case '2':
                await surfRGB();
                break;
            case '3':
                await whiteLed();
                break;
            case '4':
                await brightness(100);
                break;
            case '5':
                await brightness(1);
                break;
        }
        main();
    });
}

main();

// node index.js
