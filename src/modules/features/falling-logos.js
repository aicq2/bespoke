// src/modules/features/falling-logos.js

class FallingLogos {
  constructor() {
    this.simulationActive = false;
    this.currentEngine = null;
    this.currentRender = null;
    this.currentRunner = null;
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.resizeTimeout = null;
    this.isScrolling = false;
  }

  init() {
    if (typeof Matter === 'undefined') {
      console.warn('Matter.js library is required for falling logos');
      return;
    }

    // IntersectionObserver for initial load
    const containerElement = document.querySelector(".tag-canvas");
    if (containerElement) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            //console.log("Container intersected, starting simulation");
            this.initSimulation(true); // Force initial start
            observer.disconnect();
          }
        });
      });
      observer.observe(containerElement);
    }

    this.bindEvents();
  }

  destroySimulation() {
    if (this.simulationActive) {
      if (this.currentRender) Matter.Render.stop(this.currentRender);
      if (this.currentRunner) Matter.Runner.stop(this.currentRunner);
      if (this.currentEngine) Matter.World.clear(this.currentEngine.world);
      if (this.currentRender && this.currentRender.canvas) {
        this.currentRender.canvas.remove();
      }
      this.simulationActive = false;
    }
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    return true;
  }

  initSimulation(forceRestart = false) {
    const containerElement = document.querySelector(".tag-canvas");
    if (!containerElement) return;

    const containerWidth = containerElement.clientWidth + 2;
    const containerHeight = containerElement.clientHeight + 2;

    // Log when this runs
   /* console.log(
      `initSimulation called - Active: ${this.simulationActive}, Force: ${forceRestart}, Size: ${containerWidth}x${containerHeight}`
    );*/

    // Only restart if forced or size changed significantly
    if (
      this.simulationActive &&
      !forceRestart &&
      Math.abs(containerWidth - this.lastWidth) < 5 &&
      Math.abs(containerHeight - this.lastHeight) < 5
    ) {
      return;
    }

    this.destroySimulation();

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Events = Matter.Events,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    var engine = Engine.create();
    engine.world.gravity.y = 1;

    var world = engine.world;
    this.currentEngine = engine;

    var render = Render.create({
      element: containerElement,
      engine: engine,
      options: {
        width: containerWidth,
        height: containerHeight,
        pixelRatio: 2,
        background: "transparent",
        border: "none",
        wireframes: false,
      },
    });

    this.currentRender = render;

    var ground = Bodies.rectangle(
      containerWidth / 2 + 160,
      containerHeight + 80,
      containerWidth + 320,
      160,
      { render: { fillStyle: "#EEEFF2" }, isStatic: true }
    );
    var wallLeft = Bodies.rectangle(
      -80,
      containerHeight / 2,
      160,
      containerHeight,
      { isStatic: true }
    );
    var wallRight = Bodies.rectangle(
      containerWidth + 80,
      containerHeight / 2,
      160,
      1200,
      { isStatic: true }
    );
    var roof = Bodies.rectangle(
      containerWidth / 2 + 160,
      -80,
      containerWidth + 320,
      160,
      { isStatic: true }
    );

    World.add(engine.world, [ground, wallLeft, wallRight, roof]);

    var tagsContainer = document.querySelector(".tags-source-container");
    var allImages = tagsContainer
      ? Array.from(tagsContainer.querySelectorAll("img"))
      : [];
    var tagElements = allImages.filter((img) => this.isVisible(img));

    var tagData = tagElements.map((img) => ({
      x: Math.random() * (containerWidth - 100) + 50,
      y: Math.random() * 200 - 100,
      width: img.dataset.width ? parseInt(img.dataset.width) : 164,
      height: img.dataset.height ? parseInt(img.dataset.height) : 56,
      texture: img.src,
      xScale: img.dataset.scale ? parseFloat(img.dataset.scale) : 1,
      yScale: img.dataset.scale ? parseFloat(img.dataset.scale) : 1,
      url: img.dataset.url || null,
    }));

    var tags = tagData.map((tag) =>
      Bodies.rectangle(tag.x, tag.y, tag.width, tag.height, {
        chamfer: { radius: 20 },
        render: {
          sprite: {
            texture: tag.texture,
            xScale: tag.xScale,
            yScale: tag.yScale,
          },
        },
        url: tag.url,
        frictionAir: 0.01,
        restitution: 0.6,
        density: 0.01,
        // No need to set inertia: Infinity here as we'll be using rotation limiting instead
      })
    );

    World.add(engine.world, [...tags]);

    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
      });

    World.add(world, mouseConstraint);
    render.mouse = mouse;

    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    let click = false;
    document.addEventListener("mousedown", () => (click = true));
    document.addEventListener("mousemove", () => (click = false));

    Events.on(mouseConstraint, "mouseup", (event) => {
      var mouseConstraint = event.source;
      var bodies = engine.world.bodies;
      if (!mouseConstraint.bodyB && click) {
        for (let i = 0; i < bodies.length; i++) {
          var body = bodies[i];
          if (
            Matter.Bounds.contains(body.bounds, mouseConstraint.mouse.position)
          ) {
            var bodyUrl = body.url;
            if (bodyUrl) window.open(bodyUrl, "_blank");
            break;
          }
        }
      }
    });
    
    // Add rotation limiting functionality
    // This event runs after each physics update
    Events.on(engine, 'afterUpdate', function() {
      // Get all bodies
      var bodies = engine.world.bodies;
      
      // Loop through each body (excluding static ones like walls)
      for (let i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        
        // Skip walls and ground (static bodies)
        if (body.isStatic) continue;
        
        // Get current angle (in radians)
        let angle = body.angle;
        
        // Normalize angle between -π and π
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        
        // If angle is too extreme (upside down), correct it
        // This allows rotation of about ±45 degrees (π/4 radians)
        const maxRotation = Math.PI / 4; // Adjust this value as needed
        
        if (angle > maxRotation) {
          Matter.Body.setAngle(body, maxRotation);
          Matter.Body.setAngularVelocity(body, 0);
        } else if (angle < -maxRotation) {
          Matter.Body.setAngle(body, -maxRotation);
          Matter.Body.setAngularVelocity(body, 0);
        }
      }
    });

    var Runner = Matter.Runner;
    var runner = Runner.create();
    this.currentRunner = runner;
    Runner.run(runner, engine);
    Render.run(render);

    this.simulationActive = true;
    this.lastWidth = containerWidth;
    this.lastHeight = containerHeight;
   // console.log("Simulation started");
  }

  bindEvents() {
    // Resize handler with better scroll filtering
    window.addEventListener("resize", () => {
      if (!this.isScrolling) {
        this.handleResize();
      }
    });

    // Only trigger on significant resizes (e.g., orientation change)
    window.addEventListener("scroll", () => {
      this.isScrolling = true;
      clearTimeout(this.resizeTimeout); // Cancel resize during scroll
      setTimeout(() => (this.isScrolling = false), 100); // Reset after scroll stops
    });
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const containerElement = document.querySelector(".tag-canvas");
      if (!containerElement) return;

      const newWidth = containerElement.clientWidth;
      const newHeight = containerElement.clientHeight;

      // Only reinitialize if size change is significant
      if (
        Math.abs(newWidth - this.lastWidth) > 50 ||
        Math.abs(newHeight - this.lastHeight) > 50
      ) {
        this.initSimulation();
      }
    }, 250);
  }
}



const fallingLogos = new FallingLogos();
export { fallingLogos };