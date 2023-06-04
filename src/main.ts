import { DirectionalLight, Group, HemisphereLight, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer, TextureLoader, Color, VSMShadowMap, Vector3, Object3D, Mesh } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

const bgColor = 0x303030

const scene = new Scene()
scene.background = new Color(bgColor)

/** Camera config **/
const cameraInitialPos = new Vector3(5, 200, 400)
const cameraLook = new Vector3(5, 130, 0)
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.copy(cameraInitialPos)
camera.lookAt(cameraLook)

/** Renderer config **/
const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: document.getElementById('bg') as HTMLCanvasElement
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = VSMShadowMap;

const hemiLight = new HemisphereLight(0xaaaaaa, 0x555555, 2)
scene.add(hemiLight)

/** Load the scene **/
const fbxLoader = new FBXLoader()
fbxLoader.load('/coffee-scene.fbx', (obj: Group) => {

    /** Environment light config **/
    const dirLight = obj.children[0] as DirectionalLight
    dirLight.position.set(0, 700, 200)

    // Configure shadow
    dirLight.castShadow = true
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 2000
    dirLight.shadow.camera.right = 50
    dirLight.shadow.camera.left = -50
    dirLight.shadow.camera.top	= 50
    dirLight.shadow.camera.bottom = -50
    dirLight.shadow.blurSamples = 25
    dirLight.shadow.radius = 25
    dirLight.shadow.bias = -0.0005

    // Configure all spot light
    dirLight.children.forEach((light: any) => {
        light.intensity = 0.6
        light.castShadow = true
        light.shadow.camera.near = 1
        light.shadow.camera.far = 2000
        light.shadow.blurSamples = 25
        light.shadow.radius = 25
        light.shadow.bias = -0.01
    })

    /** Coffee model config **/
    const models = obj.children[1]
    const texture = new TextureLoader().load('/coffee-texture.png')

    const gobletMaterial = new MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
    })

    const couvertMaterial = new MeshStandardMaterial({
        color: 0x151515,
        roughness: 0.3,
    })


    /** Emit and receive shadow **/
    function configureShadow(model: Object3D) {
        model.receiveShadow = true
        model.castShadow = true
    }

    for (let i = 0; i < models.children.length; i++) {
        const goblet = models.children[i]
        const couvert = goblet.children[0]
        
        configureShadow(goblet)
        ;(goblet as Mesh).material = gobletMaterial
        
        configureShadow(couvert)
        ;(couvert as Mesh).material = couvertMaterial
    }

    scene.add(obj)
})

/** Camera move with mousemove **/
window.addEventListener('mousemove', (ev: MouseEvent) => {
    const offset = 0.2
    const newPos = {
        x: cameraInitialPos.x - (ev.clientX - (window.innerWidth / 2)) * offset,
        y: cameraInitialPos.y + (ev.clientY - (window.innerHeight / 2)) * offset
    }
    camera.position.setX(newPos.x)
    camera.position.setY(newPos.y)
    camera.lookAt(cameraLook)
})

/** Adapt the aspect to the device size when resize **/
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

/** Update render **/
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()