(function () {
  window.MDE_DEFAULT_CONFIG = {
    schemaVersion: 2,
    auth: {
      ownerPassword: "mde-owner-2026"
    },
    chat: {
      endpoint: "/api/site-agent"
    },
    brand: {
      name: "MDE Marine"
    },
    seo: {
      title: "MDE Marine | Diesel Engine Service, Repowers, Fabrication, and Parts",
      description:
        "MDE Marine provides marine diesel diagnostics, repairs, engine repowers, custom fabrication, and parts sourcing from Manns Harbor, North Carolina.",
      keywords:
        "marine diesel repair, engine repower, marine fabrication, heat exchangers, transmission cooler mounts, marine engine parts, Manns Harbor NC",
      canonicalUrl: "https://mdemarine-stitch-site.vercel.app/",
      ogImage: "https://mdemarine-stitch-site.vercel.app/assets/mde/home-boat-yard.jpg"
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
      phone: "(252) 256-1783",
      email: "mdemarineobx@gmail.com",
      serviceArea: "Manns Harbor, North Carolina"
    },
    home: {
      eyebrow: "Marine Diesel Specialists",
      headline: "Engine repowers, diagnostics, fabrication, and project support",
      subhead:
        "Practical marine diesel support for owners, captains, and boat yards—from troubleshooting and repairs to complete repower planning, custom fabrication, and hard-to-source parts.",
      stats: [
        { label: "Core Service", value: "Engine Repowers" },
        { label: "Engine Support", value: "Diagnostics & Repair" },
        { label: "Location", value: "Manns Harbor, NC" }
      ],
      services: [
        {
          kicker: "01",
          title: "Engine Services",
          copy:
            "Diagnostics, troubleshooting, maintenance, component repair, and engine or transmission rebuild support.",
          list: [
            "No-start, low-power, smoke, and overheating diagnostics",
            "Onboard component repair and replacement",
            "In-frame and out-of-frame rebuilds"
          ],
          href: "./engine-services.html"
        },
        {
          kicker: "02",
          title: "Engine Repower",
          copy:
            "Repower planning, supplier coordination, 3D scanning, CAD layout, custom mounts, and installation integration.",
          list: [
            "Pre-installation planning and fitment review",
            "Custom engine mount estimates",
            "Fabrication and vessel-system coordination"
          ],
          href: "./engine-repower.html"
        },
        {
          kicker: "03",
          title: "Marine Fabrication",
          copy:
            "Custom heat exchangers, cooler mounting kits, engine mounts, brackets, repair parts, and anodized aluminum welding.",
          list: [
            "Heat exchangers, mounts, brackets, and repair parts",
            "Transmission cooler mounting kits",
            "Anodized aluminum welding and reconstruction"
          ],
          href: "./marine-fabrication.html"
        },
        {
          kicker: "04",
          title: "Parts & Sales",
          copy:
            "Accurate parts identification and sourcing backed by decades of marine diesel supplier relationships.",
          list: [
            "45 years of parts and supplier relationships",
            "Support for Caterpillar, Cummins, Detroit, and more",
            "OEM and practical aftermarket options"
          ],
          href: "./parts-sales.html"
        }
      ],
      gallery: {
        kicker: "From the Shop",
        title: "Real work, real equipment, real boat-yard experience",
        copy:
          "MDE Marine supports projects in the shop, aboard the vessel, and alongside the boat yard from Manns Harbor, North Carolina.",
        items: [
          {
            image: "./assets/mde/home-boat-yard.jpg",
            title: "Boat-yard coordination",
            copy:
              "Project support that accounts for access, scheduling, lifting, fabrication, and the work around the engine."
          },
          {
            image: "./assets/mde/home-engine-work.jpg",
            title: "Hands-on engine work",
            copy: "Diagnostics and repairs performed where the problem actually lives."
          },
          {
            image: "./assets/mde/home-shop-dogs.jpg",
            title: "Part of the crew",
            copy: "The shop team includes two very committed floor supervisors."
          }
        ]
      },
      contact: {
        kicker: "Talk Through the Job",
        title: "Call or email MDE Marine directly",
        copy:
          "Have the vessel location, engine make and model, serial number, photos, and a short description of the issue ready when possible."
      }
    }
  };
})();
