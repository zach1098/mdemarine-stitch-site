(function () {
  window.MDE_DEFAULT_CONFIG = {
    schemaVersion: 1,
    auth: {
      ownerPassword: "mde-owner-2026"
    },
    chat: {
      endpoint: ""
    },
    brand: {
      name: "MDEmarine"
    },
    theme: {
      bg: "#eef2f5",
      panel: "#ffffff",
      panelSoft: "#dfe7ed",
      ink: "#0d1722",
      muted: "#5c6d7b",
      navy: "#0d1b2f",
      navy2: "#17375b",
      accent: "#ff7b31",
      accentSoft: "#ffb387"
    },
    contact: {
      phone: "(910) 555-0188",
      email: "service@mdemarine.com",
      serviceArea: "Carolinas + Southeast"
    },
    home: {
      eyebrow: "Marine Engine Support",
      headline: "Engine change-outs, diagnostics, fabrication, and project support",
      subhead:
        "Marine engine support, fabrication, and parts sourcing for owners, captains, and yards that need a cleaner path from first inquiry to real project scope.",
      stats: [
        { label: "Best Fit", value: "Repower Planning" },
        { label: "Problem Calls", value: "Heat, Smoke, Vibration" },
        { label: "Project Scope", value: "Dockside and Yard Work" }
      ],
      services: [
        {
          kicker: "01",
          title: "Engine services",
          copy:
            "Engine change-outs, repower planning, troubleshooting, and mechanical support for projects that need more than generic boilerplate.",
          list: [
            "Change-out planning and removal scope",
            "Overheat, no-start, smoke, and vibration diagnosis",
            "Job scoping before the yard clock starts burning"
          ],
          href: "./engine-services.html"
        },
        {
          kicker: "02",
          title: "Marine fabrication",
          copy:
            "Fabrication support for mounts, brackets, polished tubing, install cleanup, and the small metalwork jobs that always appear once a project opens up.",
          list: [
            "Mounts, brackets, trays, and repair parts",
            "Aluminum and stainless detail work",
            "Real project photo gallery from the export"
          ],
          href: "./marine-fabrication.html"
        },
        {
          kicker: "03",
          title: "Parts and sales",
          copy:
            "Parts sourcing and repair planning language that helps people explain what they need before they waste money ordering the wrong thing.",
          list: [
            "Identify the failed part first",
            "Separate urgent needs from planned work",
            "Capture engine model, serial, and photos up front"
          ],
          href: "./parts-sales.html"
        }
      ],
      gallery: {
        kicker: "Project gallery",
        title: "Real photos from the missing export",
        copy:
          "Real project imagery helps the site feel grounded and gives the fabrication and engine sections something specific to show.",
        items: [
          {
            image: "./assets/projects/team-john-deere-engine.png",
            title: "Shop and project credibility",
            copy:
              "Use this kind of image when you want the site to feel like an actual operation instead of a mockup."
          },
          {
            image: "./assets/projects/fabrication-weld-detail.png",
            title: "Fabrication detail",
            copy: "Polished tubing and weld work that looks like real shop output, because it is."
          },
          {
            image: "./assets/projects/engine-install-detail.png",
            title: "Mechanical install",
            copy: "Engine room close-up that fits the engine services page better than another AI hero image."
          }
        ]
      },
      request: {
        kicker: "Request checklist",
        title: "What to send before asking for a quote",
        helper:
          "The form below is still static. Hook it to email, a CRM, or Vercel Forms later. For now it gives the page the right structure.",
        checklist: [
          "Vessel make, model, length, and where it is located",
          "Engine brand, model, horsepower, and serial if available",
          "Whether the job is a failure diagnosis, planned repower, or fabrication request",
          "Photos of the engine space, access path, damaged parts, alarms, or current install",
          "How soon the work needs to happen, especially if haul-out or crane time is involved"
        ]
      }
    }
  };
})();
