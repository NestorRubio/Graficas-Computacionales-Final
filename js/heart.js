//creacion del espacio de la escena
function createScene () {  
    const  scene = new THREE.Scene()  
    const  camera = new THREE.PerspectiveCamera(60,  window.innerWidth / window.innerHeight, 1, 100)  
    camera.position.z = 30


    const  renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)  
    document.body.appendChild(renderer.domElement)  
    
    //creacion de un listener para permitir a la camara escuchar audio
    const listener = new THREE.AudioListener();
    camera.add( listener );
    const sound = new THREE.Audio( listener );
    const audioLoader = new THREE.AudioLoader();

    //creacion de una fuente de audio global
    audioLoader.load( '../music/TodoParaTi.ogg', function( buffer ) {
	    sound.setBuffer( buffer );
	    sound.setLoop( true );
	    sound.setVolume( 0.3 );
        sound.play();
    });

    const color = 0xFFFFFF //color de las lineas que unen los puntos del corazon 
    const intensity = 0.75 //intensidad de color de mesh de corazon

    const light1 = new THREE.PointLight(color, intensity)
    const light2 = new THREE.PointLight(color, intensity)
    const light3 = new THREE.PointLight(color, intensity)
    const light4 = new THREE.PointLight(color, intensity)

    light1.position.set(-15, -10, 30)
    light2.position.set(15, 10, 30)
    light3.position.set(-15, -10, -30)
    light4.position.set(15, 10, -30)

    scene.add(light1)
    scene.add(light2)
    scene.add(light3)
    scene.add(light4)

    //color rosa claro del fondo de la escena
    scene.background = new THREE.Color(0xcc6699);       
    return {   
      scene,
      camera,
      renderer
    }
  }

function init () {
    const {scene, camera, renderer} = createScene() //creacion de la escena donde estaran los modelos
    const { vertices, trianglesIndexes} = useCoordinates() // grafica los puntos que formaran los triangulos que formaran el corazon
    const { geo, material, heartMesh } = createHeartMesh(vertices, trianglesIndexes) //crea el mesh a partir de los puntos anteriores
    const { controls } = setControls(camera, renderer.domElement) // declara los controles(con click izq, der, y rueda de mouse) para la escena
    scene.add(heartMesh) //agrega el corazon a la escena

    const geometryCube = new THREE.BoxGeometry(10, 10, 10); //crea la geometra del cubo en escena
    const loaderCube = new THREE.TextureLoader();
    loaderCube.crossOrigin = " "; //deja el crossorigin en blanco para evitar problemas de visualizacion de las texturas

    //Asigna una textura diferente a cada cara del cubo
    const cubeMaterials = [
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale1.png')}), //lado derecho
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale2.png')}), //lado izquierdo
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale3.png')}), //arriba
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale4.png')}), //abajo
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale5.png')}), //frente
        new THREE.MeshPhongMaterial({ map: loaderCube.load('../textures/vale6.png')}) //detras
    ];
    const cube = new THREE.Mesh(geometryCube, cubeMaterials); //crea el cubo con las diferentes texturas
    scene.add(cube); //agrega el cubo a la escena
    cube.position.set(0, -5, 0); //posiciona el cubo centrado debajo del corazon

    //anima el corazon a girar sobre su propio eje y, actualiza los controles al mover. 
    const  animate = function () {
        requestAnimationFrame( animate )
        renderer.render( scene, camera )
        heartMesh.rotation.y -= 0.005
        controls.update()
    }
    animate();
}

init()

//declaracion de las coordenadas de los puntos para formar los triangulos del corazon
function useCoordinates () {
    const vertices = [
     new THREE.Vector3(0, 0, 0), // punto C
     new THREE.Vector3(0, 5, -1.5),
     new THREE.Vector3(5, 5, 0), // punto A
     new THREE.Vector3(9, 9, 0),
     new THREE.Vector3(5, 9, 2),
     new THREE.Vector3(7, 13, 0),
     new THREE.Vector3(3, 13, 0),
     new THREE.Vector3(0, 11, 0),
     new THREE.Vector3(5, 9, -2),
     new THREE.Vector3(0, 8, -3),
     new THREE.Vector3(0, 8, 3),
     new THREE.Vector3(0, 5, 1.5), // punto B
     new THREE.Vector3(-9, 9, 0),
     new THREE.Vector3(-5, 5, 0),
     new THREE.Vector3(-5, 9, -2),
     new THREE.Vector3(-5, 9, 2),
     new THREE.Vector3(-7, 13, 0),
     new THREE.Vector3(-3, 13, 0),
    ];

    //Forma los triangulos del corazon a partir de los puntos
    const trianglesIndexes = [
    // cara 1
     2,11,0, 
     2,3,4,
     5,4,3,
     4,5,6,
     4,6,7,
     4,7,10,
     4,10,11,
     4,11,2,
     0,11,13,
     12,13,15,
     12,15,16,
     16,15,17,
     17,15,7,
     7,15,10,
     11,10,15,
     13,11,15,
    // cara 2
     0,1,2,
     1,9,2,
     9,8,2,
     5,3,8,
     8,3,2,
     6,5,8,
     7,6,8,
     9,7,8,
     14,17,7,
     14,7,9,
     14,9,1,
     9,1,13,
     1,0,13,
     14,1,13,
     16,14,12,
     16,17,14,
     12,14,13
    ]
    return {
        vertices,
        trianglesIndexes
    }
}
//crea el corazon a partir de las coordenadas de los puntos y triangulos formados entre los mismos
function createHeartMesh (coordinatesList, trianglesIndexes) {
    const geo = new THREE.Geometry()
    for (let i in trianglesIndexes) {
        if ((i+1)%3 === 0) {
        geo.vertices.push(coordinatesList[trianglesIndexes[i-2]], coordinatesList[trianglesIndexes[i-1]], coordinatesList[trianglesIndexes[i]])
        geo.faces.push(new THREE.Face3(i-2, i-1, i))
    }
}

//solidifica el mesh para dar textura al corazon
geo.computeVertexNormals()
    const texture = new THREE.TextureLoader().load('../textures/texturaCorazon.png');
    const material = new THREE.MeshPhongMaterial( { map: texture } )
    const heartMesh = new THREE.Mesh(geo, material)
    return {
        geo,
        material,
        heartMesh
    }
}

//formacion del esqueleto del corazon
function addWireFrameToMesh (mesh, geometry) {
    const wireframe = new THREE.WireframeGeometry( geometry )
    const lineMat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } )
    const line = new THREE.LineSegments( wireframe, lineMat )
    mesh.add(line)
}

//funcion de los controles orbitales para moverse en la escena y hacer zoom
function  setControls (camera, domElement) {
    const controls = new  THREE.OrbitControls( camera, domElement )
    controls.update()
    
    return {
        controls
    }
}

