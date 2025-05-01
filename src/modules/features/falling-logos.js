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

    // Create engine with improved solver settings
    var engine = Engine.create({
      positionIterations: 8, // Default is 6, higher values = more accuracy
      velocityIterations: 8, // Default is 4, higher values = more accuracy
      enableSleeping: false  // Prevent bodies from "sleeping" when inactive
    });
    
    engine.world.gravity.y = 1; // Keep the same gravity

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

    // Create boundaries with lower friction to reduce sticking
    var ground = Bodies.rectangle(
      containerWidth / 2 + 160,
      containerHeight + 80,
      containerWidth + 320,
      160,
      { 
        render: { fillStyle: "#EEEFF2" }, 
        isStatic: true,
        friction: 0.1, // Lower friction to reduce sticking
        restitution: 0.2 // Slight bounce on the ground
      }
    );
    
    var wallLeft = Bodies.rectangle(
      -80,
      containerHeight / 2,
      160,
      containerHeight,
      { 
        isStatic: true,
        friction: 0.1,
        restitution: 0.5
      }
    );
    
    var wallRight = Bodies.rectangle(
      containerWidth + 80,
      containerHeight / 2,
      160,
      1200,
      { 
        isStatic: true,
        friction: 0.1,
        restitution: 0.5
      }
    );
    
    var roof = Bodies.rectangle(
      containerWidth / 2 + 160,
      -80,
      containerWidth + 320,
      160,
      { 
        isStatic: true,
        friction: 0.1,
        restitution: 0.5
      }
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

    // Create tags with improved physics properties
    var tags = tagData.map((tag) =>
      Bodies.rectangle(tag.x, tag.y, tag.width, tag.height, {
        chamfer: { radius: 12 }, // Reduced chamfer radius for better collisions
        render: {
          sprite: {
            texture: tag.texture,
            xScale: tag.xScale,
            yScale: tag.yScale,
          }
        },
        url: tag.url,
        frictionAir: 0.001, // Reduced air friction (like in the example)
        friction: 0.2,      // Reduced surface friction
        restitution: 0.5,   // Increased bounciness
        density: 0.005,     // Reduced density for more dynamic movement
        collisionFilter: {  // Improved collision filtering
          group: 0,
          category: 0x0001,
          mask: 0xFFFFFFFF
        }
      })
    );

    World.add(engine.world, [...tags]);

    // Improved mouse interaction
    var mouse = Mouse.create(render.canvas);
    
    // Adjust mouse settings for better interaction
    var mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { 
        stiffness: 0.2, 
        render: { visible: false },
        angularStiffness: 0.1 // Add angular stiffness for better control
      }
    });

    World.add(world, mouseConstraint);
    render.mouse = mouse;

    // Disable mouse wheel to prevent scrolling issues
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
        const maxRotation = Math.PI / 2; // 45 degrees rotation limit
        
        if (angle > maxRotation) {
          Matter.Body.setAngle(body, maxRotation);
          Matter.Body.setAngularVelocity(body, 0);
        } else if (angle < -maxRotation) {
          Matter.Body.setAngle(body, -maxRotation);
          Matter.Body.setAngularVelocity(body, 0);
        }
      }
    });

    // Add a "wake up" function to ensure bodies remain interactive
    // This helps with the issue of not being able to interact with some elements
    setInterval(() => {
      if (this.simulationActive) {
        var bodies = engine.world.bodies;
        for (let i = 0; i < bodies.length; i++) {
          var body = bodies[i];
          if (!body.isStatic) {
            // Apply a tiny force to keep bodies "awake"
            Matter.Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * 0.0001,
              y: (Math.random() - 0.5) * 0.0001
            });
          }
        }
      }
    }, 3000); // Every 3 seconds

    var Runner = Matter.Runner;
    var runner = Runner.create();
    this.currentRunner = runner;
    Runner.run(runner, engine);
    Render.run(render);

    this.simulationActive = true;
    this.lastWidth = containerWidth;
    this.lastHeight = containerHeight;
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