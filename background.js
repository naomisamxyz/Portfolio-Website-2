import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// CONTROLS
// ============================================================

// ANIMATION
const SPEED = 0.5;


// ------------------------------------------------------------
// SLIT SCAN
// ------------------------------------------------------------

const SCAN_FREQUENCY = 5.0;
const SCAN_STRENGTH = 0.6;
const STRETCH = 0.5;
const SCAN_SOFTNESS = 0.65;

// 0 = vertical
// 1 = horizontal
const DIRECTION_MIX = 0.6;


// ------------------------------------------------------------
// TEXTURE SIZE
// Smaller = larger texture
// ------------------------------------------------------------

const TEXTURE_1_SCALE = 0.10;
const TEXTURE_2_SCALE = 0.30;
const TEXTURE_3_SCALE = 0.10;


// ------------------------------------------------------------
// TEXTURE DOMINANCE
// ------------------------------------------------------------

const TEXTURE_1_STRENGTH = 1.0;
const TEXTURE_2_STRENGTH = 2.0;
const TEXTURE_3_STRENGTH = 1.5;


// ------------------------------------------------------------
// COLOR
// ------------------------------------------------------------

const TEXTURE_1_SATURATION = 0.8;
const TEXTURE_2_SATURATION = 1.0;
const TEXTURE_3_SATURATION = 1.0;

const TEXTURE_1_BRIGHTNESS = 1.5;
const TEXTURE_2_BRIGHTNESS = 1.0;
const TEXTURE_3_BRIGHTNESS = 1.0;

const SATURATION = 1.2;
const CONTRAST = 1.2;
const BRIGHTNESS = 1.0;


// Minimum final luminance.
// Raise this if you still want fewer/decreased dark areas.
const MIN_LUMINANCE = 0.08;


// ------------------------------------------------------------
// BLUR
// ------------------------------------------------------------

const BLUR = 40;


// ============================================================
// THREE.JS SETUP
// ============================================================

const canvas =
    document.getElementById("background");

const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

const scene =
    new THREE.Scene();

const camera =
    new THREE.Camera();


// ============================================================
// TEXTURES
// ============================================================

const loader =
    new THREE.TextureLoader();

const texture1 =
    loader.load(
        "texture1.png"
    );

const texture2 =
    loader.load(
        "texture2.png"
    );

const texture3 =
    loader.load(
        "texture3.png"
    );

[
    texture1,
    texture2,
    texture3
].forEach(texture => {

    texture.wrapS =
        THREE.RepeatWrapping;

    texture.wrapT =
        THREE.RepeatWrapping;

});


// ============================================================
// SHADER
// ============================================================

const material =
    new THREE.ShaderMaterial({

        uniforms: {

            uTime: {
                value: 0
            },

            uTexture1: {
                value: texture1
            },

            uTexture2: {
                value: texture2
            },

            uTexture3: {
                value: texture3
            },

            uSpeed: {
                value: SPEED
            },

            uScanFrequency: {
                value: SCAN_FREQUENCY
            },

            uScanStrength: {
                value: SCAN_STRENGTH
            },

            uStretch: {
                value: STRETCH
            },

            uScanSoftness: {
                value: SCAN_SOFTNESS
            },

            uDirectionMix: {
                value: DIRECTION_MIX
            },

            uTexture1Scale: {
                value: TEXTURE_1_SCALE
            },

            uTexture2Scale: {
                value: TEXTURE_2_SCALE
            },

            uTexture3Scale: {
                value: TEXTURE_3_SCALE
            },

            uTexture1Strength: {
                value: TEXTURE_1_STRENGTH
            },

            uTexture2Strength: {
                value: TEXTURE_2_STRENGTH
            },

            uTexture3Strength: {
                value: TEXTURE_3_STRENGTH
            },

            uTexture1Saturation: {
                value: TEXTURE_1_SATURATION
            },

            uTexture2Saturation: {
                value: TEXTURE_2_SATURATION
            },

            uTexture3Saturation: {
                value: TEXTURE_3_SATURATION
            },

            uTexture1Brightness: {
                value: TEXTURE_1_BRIGHTNESS
            },

            uTexture2Brightness: {
                value: TEXTURE_2_BRIGHTNESS
            },

            uTexture3Brightness: {
                value: TEXTURE_3_BRIGHTNESS
            },

            uSaturation: {
                value: SATURATION
            },

            uContrast: {
                value: CONTRAST
            },

            uBrightness: {
                value: BRIGHTNESS
            },

            uMinLuminance: {
                value: MIN_LUMINANCE
            }

        },


        // ====================================================
        // VERTEX SHADER
        // ====================================================

        vertexShader: `

            varying vec2 vUv;

            void main() {

                vUv = uv;

                gl_Position =
                    vec4(
                        position,
                        1.0
                    );
            }

        `,


        // ====================================================
        // FRAGMENT SHADER
        // ====================================================

        fragmentShader: `

            uniform float uTime;
            uniform float uSpeed;

            uniform sampler2D uTexture1;
            uniform sampler2D uTexture2;
            uniform sampler2D uTexture3;

            uniform float uScanFrequency;
            uniform float uScanStrength;
            uniform float uStretch;
            uniform float uScanSoftness;
            uniform float uDirectionMix;

            uniform float uTexture1Scale;
            uniform float uTexture2Scale;
            uniform float uTexture3Scale;

            uniform float uTexture1Strength;
            uniform float uTexture2Strength;
            uniform float uTexture3Strength;

            uniform float uTexture1Saturation;
            uniform float uTexture2Saturation;
            uniform float uTexture3Saturation;

            uniform float uTexture1Brightness;
            uniform float uTexture2Brightness;
            uniform float uTexture3Brightness;

            uniform float uSaturation;
            uniform float uContrast;
            uniform float uBrightness;
            uniform float uMinLuminance;

            varying vec2 vUv;


            // =================================================
            // RANDOM
            // =================================================

            float random(float x) {

                return fract(
                    sin(
                        x * 127.1
                    ) *
                    43758.5453
                );
            }


            // =================================================
            // SMOOTH NOISE
            // =================================================

            float noise(float x) {

                float i =
                    floor(x);

                float f =
                    fract(x);

                f =
                    f *
                    f *
                    (3.0 - 2.0 * f);

                return mix(
                    random(i),
                    random(i + 1.0),
                    f
                );
            }


            // =================================================
            // SATURATION
            // =================================================

            vec3 adjustSaturation(
                vec3 color,
                float amount
            ) {

                float luminance =
                    dot(
                        color,
                        vec3(
                            0.299,
                            0.587,
                            0.114
                        )
                    );

                return mix(
                    vec3(luminance),
                    color,
                    amount
                );
            }


            // =================================================
            // CONTRAST
            // =================================================

            vec3 adjustContrast(
                vec3 color,
                float amount
            ) {

                return
                    (color - 0.5) *
                    amount +
                    0.5;
            }


            // =================================================
            // MIXED-DIRECTION SLIT SCAN
            // =================================================

            vec2 slitScan(
                vec2 uv,
                float time,
                float offset
            ) {

                // VERTICAL SLIT FIELD

                float scanX =

                    uv.x *
                    uScanFrequency +

                    offset;


                float verticalField1 =
                    noise(
                        scanX +
                        time * 0.7
                    );


                float verticalField2 =
                    noise(
                        scanX * 2.0 -
                        time * 0.35
                    );


                float verticalDisplacement =

                    (verticalField1 - 0.5) *
                    0.75 +

                    (verticalField2 - 0.5) *
                    0.25;


                // HORIZONTAL SLIT FIELD

                float scanY =

                    uv.y *
                    uScanFrequency *
                    0.65 +

                    offset +

                    7.0;


                float horizontalField1 =
                    noise(
                        scanY -
                        time * 0.5
                    );


                float horizontalField2 =
                    noise(
                        scanY * 1.7 +
                        time * 0.25
                    );


                float horizontalDisplacement =

                    (horizontalField1 - 0.5) *
                    0.75 +

                    (horizontalField2 - 0.5) *
                    0.25;


                // DIRECTION MIX

                float verticalAmount =
                    1.0 -
                    uDirectionMix;

                float horizontalAmount =
                    uDirectionMix;


                // DISPLACEMENT

                uv.y +=

                    verticalDisplacement *
                    uScanStrength *
                    verticalAmount;


                uv.x +=

                    horizontalDisplacement *
                    uScanStrength *
                    horizontalAmount;


                // STRETCH

                float verticalStretch =

                    1.0 -

                    uStretch *
                    verticalField1 *
                    verticalAmount;


                float horizontalStretch =

                    1.0 -

                    uStretch *
                    horizontalField1 *
                    horizontalAmount;


                uv.y =

                    (uv.y - 0.5) *

                    max(
                        verticalStretch,
                        0.02
                    )

                    + 0.5;


                uv.x =

                    (uv.x - 0.5) *

                    max(
                        horizontalStretch,
                        0.02
                    )

                    + 0.5;


                // SUBTLE CROSS MOVEMENT

                uv.x +=

                    sin(
                        scanX +
                        time
                    ) *

                    0.004 *

                    verticalAmount;


                uv.y +=

                    sin(
                        scanY -
                        time
                    ) *

                    0.004 *

                    horizontalAmount;


                return uv;
            }


            // =================================================
            // MAIN
            // =================================================

            void main() {

                vec2 uv =
                    vUv;


                float time =
                    uTime *
                    uSpeed;


                // =============================================
                // THREE INDEPENDENT SCANS
                // =============================================

                vec2 uv1 =
                    slitScan(
                        uv,
                        time,
                        0.0
                    );


                vec2 uv2 =
                    slitScan(
                        uv,
                        time * 0.8,
                        4.7
                    );


                vec2 uv3 =
                    slitScan(
                        uv,
                        time * 1.2,
                        9.3
                    );


                // =============================================
                // TEXTURE SCALE
                // =============================================

                uv1 =

                    (uv1 - 0.5) *
                    uTexture1Scale +
                    0.5;


                uv2 =

                    (uv2 - 0.5) *
                    uTexture2Scale +
                    0.5;


                uv3 =

                    (uv3 - 0.5) *
                    uTexture3Scale +
                    0.5;


                // =============================================
                // SAMPLE TEXTURES
                // =============================================

                vec3 tex1 =
                    texture2D(
                        uTexture1,
                        uv1
                    ).rgb;


                vec3 tex2 =
                    texture2D(
                        uTexture2,
                        uv2
                    ).rgb;


                vec3 tex3 =
                    texture2D(
                        uTexture3,
                        uv3
                    ).rgb;


                // =============================================
                // INDIVIDUAL COLOR
                // =============================================

                tex1 =
                    adjustSaturation(
                        tex1,
                        uTexture1Saturation
                    ) *
                    uTexture1Brightness;


                tex2 =
                    adjustSaturation(
                        tex2,
                        uTexture2Saturation
                    ) *
                    uTexture2Brightness;


                tex3 =
                    adjustSaturation(
                        tex3,
                        uTexture3Saturation
                    ) *
                    uTexture3Brightness;


                // =============================================
                // VERTICAL BLEND MASKS
                // =============================================

                float verticalMask1 =
                    noise(

                        uv.x *
                        uScanFrequency +

                        time * 0.6
                    );


                float verticalMask2 =
                    noise(

                        uv.x *
                        uScanFrequency *
                        0.8 -

                        time * 0.4 +

                        12.0
                    );


                // =============================================
                // HORIZONTAL BLEND MASKS
                // =============================================

                float horizontalMask1 =
                    noise(

                        uv.y *
                        uScanFrequency *
                        0.65 -

                        time * 0.35 +

                        5.0
                    );


                float horizontalMask2 =
                    noise(

                        uv.y *
                        uScanFrequency *
                        0.55 +

                        time * 0.3 +

                        19.0
                    );


                // =============================================
                // MIX VERTICAL + HORIZONTAL MASKS
                // =============================================

                float mask1 =
                    mix(
                        verticalMask1,
                        horizontalMask1,
                        uDirectionMix
                    );


                float mask2 =
                    mix(
                        verticalMask2,
                        horizontalMask2,
                        uDirectionMix
                    );


                // =============================================
                // TRANSITION SOFTNESS
                // =============================================

                float softness =
                    max(
                        uScanSoftness,
                        0.001
                    );


                mask1 =
                    smoothstep(

                        0.5 -
                        softness * 0.5,

                        0.5 +
                        softness * 0.5,

                        mask1
                    );


                mask2 =
                    smoothstep(

                        0.5 -
                        softness * 0.5,

                        0.5 +
                        softness * 0.5,

                        mask2
                    );


                // =============================================
                // TEXTURE DOMINANCE
                // =============================================

                float w1 =

                    max(
                        uTexture1Strength,
                        0.0
                    ) *

                    (1.0 - mask1);


                float w2 =

                    max(
                        uTexture2Strength,
                        0.0
                    ) *

                    mask1 *

                    (1.0 - mask2);


                float w3 =

                    max(
                        uTexture3Strength,
                        0.0
                    ) *

                    mask2;


                float totalWeight =
                    w1 +
                    w2 +
                    w3;


                // =============================================
                // TEXTURE MIXING
                // =============================================

                vec3 finalColor;


                if (
                    totalWeight >
                    0.0001
                ) {

                    finalColor =

                        (
                            tex1 * w1 +
                            tex2 * w2 +
                            tex3 * w3
                        )

                        /

                        totalWeight;

                }

                else {

                    finalColor =
                        tex1;

                }


                // =============================================
                // FINAL COLOR
                // =============================================

                finalColor =
                    adjustSaturation(
                        finalColor,
                        uSaturation
                    );


                finalColor =
                    adjustContrast(
                        finalColor,
                        uContrast
                    );


                finalColor *=
                    uBrightness;


                // =============================================
                // DARK COLOR PROTECTION
                //
                // IMPORTANT:
                // This happens AFTER saturation, contrast,
                // and brightness.
                //
                // It raises the whole RGB color proportionally,
                // rather than individually clamping channels.
                // =============================================

                float finalLuminance =
                    dot(
                        finalColor,
                        vec3(
                            0.299,
                            0.587,
                            0.114
                        )
                    );


                if (
                    finalLuminance <
                    uMinLuminance
                ) {

                    finalColor *=

                        uMinLuminance /

                        max(
                            finalLuminance,
                            0.001
                        );

                }


                // =============================================
                // SAFE OUTPUT RANGE
                // =============================================

                finalColor =
                    clamp(
                        finalColor,
                        0.0,
                        1.0
                    );


                gl_FragColor =
                    vec4(
                        finalColor,
                        1.0
                    );
            }

        `
    });


// ============================================================
// FULLSCREEN PLANE
// ============================================================

const geometry =
    new THREE.PlaneGeometry(
        2,
        2
    );


const mesh =
    new THREE.Mesh(
        geometry,
        material
    );


scene.add(mesh);


// ============================================================
// BLUR
// ============================================================

canvas.style.position =
    "fixed";

canvas.style.inset =
    "0";

canvas.style.width =
    "100%";

canvas.style.height =
    "100%";

canvas.style.transform =
    "scale(1.1)";

canvas.style.filter =
    `blur(${BLUR}px)`;

canvas.style.zIndex =
    "-1";


// ============================================================
// ANIMATION
// ============================================================

const clock =
    new THREE.Clock();


function animate() {

    material.uniforms.uTime.value =
        clock.getElapsedTime();


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        animate
    );
}


animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


