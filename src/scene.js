//EXT LIBRARIES 
import './main.css'

import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

			import { HDRJPGLoader } from '@monogrid/gainmap-js';

			const params = {
				envMap: '4k',
				blur:0,
				roughness: 0.0,
				metalness: 1.0,
				exposure: 1.0,
				debug: false
			};

			let container, stats;
			let camera, scene, renderer, controls;
			let torusMesh, planeMesh;
			let hdrJpg,hdrJpg2, hdrJpgPMREMRenderTarget4k, hdrJpgEquirectangularMap4k, hdrJpgPMREMRenderTarget8k, hdrJpgEquirectangularMap8k;
			let hdrPMREMRenderTarget, hdrEquirectangularMap;


			const fileSizes = {};

			init();
			animate();

			function init() {

				const lbl = document.getElementById( 'lbl_left' );

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 500 );
				camera.position.set( 0, 0, - 120 );

				scene = new THREE.Scene();

				renderer = new THREE.WebGLRenderer();
				renderer.toneMapping = THREE.ACESFilmicToneMapping;

				hdrJpg = new HDRJPGLoader( renderer )
				.load( 'https://foveate3dn.nyc3.cdn.digitaloceanspaces.com/foveate_site_prod_assets/hdrs/citynight_cgib_XIE_062053_HDR_01_11539060_RAY-RES_4K.jpg', function ( ) {

					hdrJpgEquirectangularMap4k = hdrJpg.renderTarget.texture;
					hdrJpgPMREMRenderTarget4k = pmremGenerator.fromEquirectangular( hdrJpgEquirectangularMap4k );

					hdrJpgEquirectangularMap4k.mapping = THREE.EquirectangularReflectionMapping;
					hdrJpgEquirectangularMap4k.needsUpdate = true;

					hdrJpg.dispose();

				}, function ( progress ) {} );


				let geometry = new THREE.TorusKnotGeometry( 18, 8, 200, 40, 1, 3 );
				let material = new THREE.MeshStandardMaterial( {
					color: 0xffffff,
					metalness: params.metalness,
					roughness: params.roughness
				} );

				torusMesh = new THREE.Mesh( geometry, material );
				scene.add( torusMesh );


				geometry = new THREE.PlaneGeometry( 200, 200 );
				material = new THREE.MeshBasicMaterial();

				planeMesh = new THREE.Mesh( geometry, material );
				planeMesh.position.y = - 50;
				planeMesh.rotation.x = - Math.PI * 0.5;
				scene.add( planeMesh );


				const pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();

				THREE.DefaultLoadingManager.onLoad = function ( ) {

					pmremGenerator.dispose();

				};

				
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				

				stats = new Stats();

				controls = new OrbitControls( camera, renderer.domElement );
				controls.minDistance = 50;
				controls.maxDistance = 300;

				window.addEventListener( 'resize', onWindowResize );

				const gui = new GUI();

				gui.add( params, 'envMap', [ '4k', '8k' ] ).onChange( displayStats );
				gui.add( params, 'blur', 0, 1, 0.01 );
				gui.add( params, 'roughness', 0, 1, 0.01 );
				gui.add( params, 'metalness', 0, 1, 0.01 );
				gui.add( params, 'exposure', 0, 2, 0.01 );
				gui.add( params, 'debug' );
				gui.open();

				function displayStats(){
					if(params.envMap=='4k'){

						hdrJpg = new HDRJPGLoader( renderer )
						.load( 'https://foveate3dn.nyc3.cdn.digitaloceanspaces.com/foveate_site_prod_assets/hdrs/citynight_cgib_XIE_062053_HDR_01_11539060_RAY-RES_4K.jpg', function ( ) {
	
							hdrJpgEquirectangularMap4k = hdrJpg.renderTarget.texture;
							hdrJpgPMREMRenderTarget4k = pmremGenerator.fromEquirectangular( hdrJpgEquirectangularMap4k );
	
							hdrJpgEquirectangularMap4k.mapping = THREE.EquirectangularReflectionMapping;
							hdrJpgEquirectangularMap4k.needsUpdate = true;
	
							hdrJpg.dispose();
	
					}, function ( progress ) {} );
	
				}else if(params.envMap=='8k'){
					hdrJpg = new HDRJPGLoader( renderer )
					.load( 'https://foveate3dn.nyc3.cdn.digitaloceanspaces.com/foveate_site_prod_assets/hdrs/citynight_cgib_XIE_062053_HDR_01_11539060_RAY-RES_8K.jpg', function ( ) {
	
						hdrJpgEquirectangularMap8k = hdrJpg.renderTarget.texture;
						hdrJpgPMREMRenderTarget8k = pmremGenerator.fromEquirectangular( hdrJpgEquirectangularMap8k );
	
						hdrJpgEquirectangularMap8k.mapping = THREE.EquirectangularReflectionMapping;
						hdrJpgEquirectangularMap8k.needsUpdate = true;
	
						hdrJpg.dispose();
	
					}, function ( progress ) {} );
	
	
					}
				}

			}


			function onWindowResize() {

				const width = window.innerWidth;
				const height = window.innerHeight;

				camera.aspect = width / height;
				camera.updateProjectionMatrix();

				renderer.setSize( width, height );

			}

			function animate() {

				requestAnimationFrame( animate );

				stats.begin();
				render();
				stats.end();

			}

			function render() {

				scene.backgroundBlurriness = params.blur;
			
				torusMesh.material.roughness = params.roughness;
				torusMesh.material.metalness = params.metalness;

				let pmremRenderTarget, equirectangularMap;

				switch ( params.envMap ) {

					case '4k':
						pmremRenderTarget = hdrJpgPMREMRenderTarget4k;
						equirectangularMap = hdrJpgEquirectangularMap4k;
						break;
					case '8k':
						pmremRenderTarget = hdrJpgPMREMRenderTarget8k;
						equirectangularMap = hdrJpgEquirectangularMap8k;
						break;

				}

				const newEnvMap = pmremRenderTarget ? pmremRenderTarget.texture : null;

				if ( newEnvMap && newEnvMap !== torusMesh.material.envMap ) {

					planeMesh.material.map = newEnvMap;
					planeMesh.material.needsUpdate = true;

				}

				torusMesh.rotation.y += 0.005;
				planeMesh.visible = params.debug;

				scene.environment = equirectangularMap;
				scene.background = equirectangularMap;
				renderer.toneMappingExposure = params.exposure;

				renderer.render( scene, camera );

			}
