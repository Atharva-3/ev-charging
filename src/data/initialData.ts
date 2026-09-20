import { BoqCategory, ChecklistData } from '../types';

export const INITIAL_BOQ_DATA: Record<string, BoqCategory[]> = {
  "vst-joatwara": [
    {
      num: 1,
      name: "Power Infra",
      total: 0,
      items: [
        { sr: "1.1", desc: "Submission of EV Connection Application Forms 120KW(As Per Actual)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "As per actual" },
        { sr: "1.2", desc: "Submission of EV Connection Application Forms 90 Kw(As Per Actual)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "As per actual" },
        { sr: "1.3", desc: "Submission of EV Connection Application Forms 60Kw(As Per Actual)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "As per actual" },
        { sr: "1.4", desc: "Submission of EV Connection Application Forms 30Kw(As Per Actual)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "As per actual" },
        { sr: "1.5", desc: "Demand Note for security deposit of 90 Kw load(As Per Actual)", make: "DISCOM approved", unit: "Kw", uom: 1, rate: 0, total: 0, remark: "As per actual" },
        { sr: "1.6", desc: "Safety and CEIG clearance and necessary approval for final discom approval(If Required)", make: "DISCOM approved", unit: "Kw", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.7", desc: "Liasioning Fees for 120/90 Kw/60Kw/30Kw load", make: "DISCOM approved", unit: "Kw", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.8", desc: "Misc. Expenses for Discom AE and JE", make: "DISCOM approved", unit: "Kw", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.9", desc: "Supply & Erection of 3 Way RMU/VCB (If Required)-250A", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.10", desc: "Supply & Erection of 3 Way RMU/VCB (If Required)-350A", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "", desc: "Supply & Erection of 3 Way RMU/VCB (If Required)-630A", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.11", desc: "Supply & Erection of HT Metering Cubicle(If Required)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.12", desc: "11 kV Disconnect Switch, complete with operating mechanism, mounting structure, connectors, and all necessary accessories(If Required)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.13", desc: "11 kV Load Break Switch (LBS) complete with operating mechanism, protection devices, interlocks, cable terminations, and all necessary accessories(If Required)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.14", desc: "11 kV Vacuum Circuit Breaker (VCB) / High Voltage Fuse Unit, complete with operating mechanism, protection and control accessories, and all necessary fittings.(If Required)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.15", desc: "Supply & Erection of Single Way GOS Structure including GI pipe of HT cable routing.Supporting Clamp with Spun Pole", make: "DISCOM approved", unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.16", desc: "Supply & Erection of 95 Sqmm HT UG Cable(If Required)", make: "DISCOM approved", unit: "Meter", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.17", desc: "Supply & Erection of 70 Sqmm HT UG Cable(If Required)", make: "DISCOM approved", unit: "Meter", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.18", desc: "Supply & Erection of 50 Sqmm HT UG Cable(If Required)", make: "DISCOM approved", unit: "Meter", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.19", desc: "GI Pipe Earthing [ LT Meter - 2Nos, RMU/VCB -2 Nos and Spun Pool-2Nos)", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.20", desc: "Copper Plate Earthing for Transformer Neutral", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.21", desc: "Civil works [ Transfomer -1 No, RMU - 1 No, Meter Cublic -1 No)", make: "DISCOM approved", unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "If Required by DISCOM" },
        { sr: "1.22", desc: "HT -MRT Testing and Commissioning with complete set of CT and PT(If Required)", make: "DISCOM approved", unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "1.23", desc: "SITC of LA for Cu-Spikes", make: "DISCOM approved", unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "Manadatory" },
        { sr: "1.24", desc: "HT Fenching work,Cage fittings,with entry exit provision(If Required)", make: "DISCOM approved", unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" }
      ]
    },
    {
      num: 2,
      name: "Type Of Transformer",
      total: 0,
      items: [
        { sr: "2.1", desc: "Transformer - 250KVA \nIncludes-Supply,Testing,I&C\nCapacity:315 kVA(11KV/433V)-ONAN Trafo (Level-2), revelent IS-Preferably DISCOM approved.In case of different make,DISCOM testing and approval shall be considered in resposbility.", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "2.2", desc: "Transformer - 200KVA \nIncludes-Supply,Testing,I&C\nCapacity:200 kVA(11KV/433V)-ONAN Trafo (Level-2), revelent IS-Preferably DISCOM approved.In case of different make,DISCOM testing and approval shall be considered in resposbility.", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "2.3", desc: "Transformer - 150KVA \nIncludes-Supply,Testing,I&C\nCapacity:150 kVA(11KV/433V)-ONAN Trafo (Level-2), revelent IS-Preferably DISCOM approved.In case of different make,DISCOM testing and approval shall be considered in resposbility.", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "2.4", desc: "Transformer - 100KVA \nIncludes-Supply,Testing,I&C\nCapacity:100 kVA(11KV/433V)-ONAN Trafo (Level-2), revelent IS-Preferably DISCOM approved.In case of different make,DISCOM testing and approval shall be considered in resposbility.", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "2.5", desc: "CT meter and testing with required Discom Approval /Tested Meter and accessories in waterproof enclosure orindoor enclosure as per DISCOM Requirement", make: "DISCOM approved", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "2.6", desc: "Transformer - 250 KVA/200 KVA/150KVA/100KVA Installation & Commissioning including oil filtration and testing", make: "", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" }
      ]
    },
    {
      num: 3,
      name: "Electrical ACDB/DB-Box",
      total: 556000,
      items: [
        {
          sr: "3.1",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\nIncoming: 1 x 4P 630 A,36kA MCCB\nMeter CT Ratio : 630/5A\nOutgoing : \n- 800A, 415V, AL BUSBAR, 25kA\n6 x 4P 125A,36kA MCCB\n1 x 4P 63A,36kA MCCB\n6 A, 240V, DP MCB: 2 No for camera.\n- 16 A, 240V, DP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 556000,
          total: 556000,
          remark: "MCCB for 630 KW load"
        },
        {
          sr: "3.2",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\n- 300 A,36k 415V, FP MCCB: 1 No.\n- Multifunction Meter(KWH) with 250/0.5A CT, with all accessories.\n- 30mA, ELCB: 1 No.\n- Indicator R Y B\n- ON, OFF, Trip Indicator\nOUTGOING:\n- 500A, 415V, AL BUSBAR, 25kA\n- 125A, 415V, FP MCCB: 2 No.\n- 63A, 415V, FP MCCB: 1No.\n- 16 A, 240V, DP MCB: 2 No for camera.\n- 63 A, 240V, FP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        },
        {
          sr: "3.3",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\n- 250 A,36k 415V, FP MCCB: 1 No.\n- Multifunction Meter(KWH) with 250/0.5A CT, with all accessories.\n- 30mA, ELCB: 1 No.\n- Indicator R Y B\n- ON, OFF, Trip Indicator\nOUTGOING:\n- 400A, 415V, AL BUSBAR, 25kA\n- 125A, 415V, FP MCCB: 2 No.\n- 16 A, 240V, DP MCB: 2 No for camera.\n- 63 A, 240V, FP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        },
        {
          sr: "3.4",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\n- 200 A,36k 415V, FP MCCB: 1 No.\n- Multifunction Meter(KWH) with 250/0.5A CT, with all accessories.\n- 30mA, ELCB: 1 No.\n- Indicator R Y B\n- ON, OFF, Trip Indicator\nOUTGOING:\n- 350A, 415V, AL BUSBAR, 25kA\n- 125A, 415V, FP MCCB: 1 No.\n- 63A, 415V, FP MCCB: 1 No.\n- 16 A, 240V, DP MCB: 2 No for camera.\n- 63 A, 240V, FP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        },
        {
          sr: "3.5",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\n- 150 A,36k 415V, FP MCCB: 1 No.\n- Multifunction Meter(KWH) with 250/0.5A CT, with all accessories.\n- 30mA, ELCB: 1 No.\n- Indicator R Y B\n- ON, OFF, Trip Indicator\nOUTGOING:\n- 300A, 415V, AL BUSBAR, 25kA\n- 125A, 415V, FP MCCB: 1 No.\n- 16 A, 240V, DP MCB: 2 No for camera.\n- 63 A, 240V, FP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        },
        {
          sr: "3.6",
          desc: "SITC of ACDB Box weather proof( OUTDOOR IP 65) with required holes and Earthing Bus bar\nINCOMING:\n- 100 A,36k 415V, FP MCCB: 1 No.\n- Multifunction Meter(KWH) with 250/0.5A CT, with all accessories.\n- 30mA, ELCB: 1 No.\n- Indicator R Y B\n- ON, OFF, Trip Indicator\nOUTGOING:\n- 300A, 415V, AL BUSBAR, 25kA\n- 63A, 415V, FP MCCB: 1 No.\n- 16 A, 240V, DP MCB: 2 No for camera.\n- 63 A, 240V, FP MCB with Timer and contractor for lights and branding: 1 No.\n- 1A, 240V, 6 Pin Switch and Socket inside the panel: 1 No.\nThis DB includes Digital MF meter(kW, kVA, kWh, kVAr, PF, Hz, etc), Indicating Phase Lamp for RYB, ON, OFF, TRIP with SP MCB.",
          make: "Approved Make ABB/L&T",
          unit: "Nos",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        },
        {
          sr: "3.7",
          desc: "INCOMING \n- Static Kwh Meters (KWH)\nOUTGOING (depend on power supply)\n- 25A, 415V, FP MCCB: 1 No. (for 3 phase)\n- 63A, 240V, DP MCB: 1 No (for 1 phase)",
          make: "",
          unit: "",
          uom: 1,
          rate: 0,
          total: 0,
          remark: ""
        }
      ]
    },
    {
      num: 4,
      name: "Cabling and Termination",
      total: 285700,
      items: [
        { sr: "", desc: "Supply,laying(includes cable dressing,clamping,tagging at ends) & Testing of XLPE insulated PVC sheathed aluminium conductor, 1.1 kV grade,FRLS Armoured cable conforming to IS:7098, as per approved make.The cable shall be suitable to lay directly underground /Trenches/Conduits/Cable trays as per the Cable routing Layouts & direction of Engineer In-charge", make: "Preferred : Polycab / KEI / equivalent", unit: "", uom: "", rate: 2050, total: 0, remark: "" },
        { sr: "4.1", desc: "3.5 Core x 240 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 85, rate: 2000, total: 170000, remark: "" },
        { sr: "4.2", desc: "3.5 Core x 185 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.3", desc: "3.5 Core x 150 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.4", desc: "3.5 Core x 120 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.5", desc: "3.5 Core x 95 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.6", desc: "3.5 Core x 70 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.7", desc: "3.5 Core x 50 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 95, rate: 785, total: 74575, remark: "" },
        { sr: "4.8", desc: "3.5 Core x 35 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.9", desc: "3.5 Core x 25 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.10", desc: "3.5 Core x 16 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.11", desc: "4 Core x 10 sq. mm Aluminium Cable", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.12", desc: "Supply, laying & Testing of XLPE insulated PVC sheathed Copper conductor, 1.1 kV grade Armoured FRLS cable:1 Core x 16 sq. mm Copper Cable(Green)", make: 0, unit: "Meter", uom: 50, rate: 395, total: 19750, remark: "" },
        { sr: "4.13", desc: "1 Core x 10 sq. mm Copper Cable(Green)", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "4.14", desc: "3 Core x 2.5 sq. mm Copper Cable-Signage/Camera", make: "", unit: "Meter", uom: 95, rate: 225, total: 21375, remark: "" }
      ]
    },
    {
      num: 5,
      name: "Cable Terminations -Double Compression",
      total: 45300,
      items: [
        { sr: "5.1", desc: "Providing, termination of 1.1 kV grade armoured cable for the following sizes including supply of heavy duty Double Compression cable glands, crimping type lugs and allied jointing materials, etc. with proper crimping tool, all complete as per specification & direction of Engineer In-charge. Glands and lugs shall be of approved make. Heavy duty Copper lugs for copper cables and aluminium lugs for aluminium cables shall be used.", make: "Make: Raychem/3M\nMention Make\nDowells / Jainson", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: "5.2", desc: "3.5 Core x 240 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 4, rate: 5200, total: 20800, remark: "" },
        { sr: "5.3", desc: "3.5 Core x 185 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.4", desc: "3.5 Core x 150 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.5", desc: "3.5 Core x 120 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.6", desc: "3.5 Core x 95 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.7", desc: "3.5 Core x 70 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.8", desc: "3.5 Core x 50 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 10, rate: 2450, total: 24500, remark: "" },
        { sr: "5.9", desc: "3.5 Core x 35 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.10", desc: "3.5 Core x 25 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.11", desc: "3.5 Core x 16 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "5.12", desc: "4 Core x 10 sq. mm Aluminium Cable", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" }
      ]
    },
    {
      num: 6,
      name: "Cable Terminations -Single Compression",
      total: 6200,
      items: [
        { sr: "6.1", desc: "Providing, termination of 1.1 kV grade unarmoured cable for the following sizes including supply of heavy duty single Compression cable glands, crimping type lugs and allied jointing materials along with bi-metalic washer, etc. all complete as per specification & direction of Engineer In-charge. Glands and lugs shall be of approved make. Copper lugs for copper cables and aluminium lugs for aluminium cables shall be used.", make: "Make: Raychem/3M\nMention Make\nDowells / Jainson", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: "6.2", desc: "1 Core x 16 sq. mm Copper Cable(Green)", make: "", unit: "Nos", uom: 12, rate: 350, total: 4200, remark: "" },
        { sr: "6.3", desc: "1 Core x 10 sq. mm Copper Cable(Green)", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "6.4", desc: "3 Core x 2.5 sq. mm Copper Cable-Signage/Camera", make: "", unit: "Nos", uom: 8, rate: 250, total: 2000, remark: "" }
      ]
    },
    {
      num: 7,
      name: "Point Wiring /Power Socket and Lightening System",
      total: 480,
      items: [
        { sr: 7.1, desc: "Point wiring for Power socket and switchboard-5A", make: "", unit: "Nos", uom: 1, rate: 480, total: 480, remark: "" },
        { sr: 7.2, desc: "Point wiring for Power socket and switchboard-16A", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: 7.3, desc: "9 m Hot-Dip Galvanized Curved Steel Lighting Pole complete with 120 W LED Luminaire, junction box, terminal block, internal wiring, and all necessary mounting accessories.", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" }
      ]
    },
    {
      num: 8,
      name: "Solid Bottom Cable Tray/PVC Conduits",
      total: 68015,
      items: [
        { sr: "8.1", desc: "Supplying, fabricating and installing following sizes of GI solid bottom cable trays with cover including horizontal and vertical bends, reducers, tees, cross members and other accessories as required and duly laid on cable trenches with MS suspenders, angles, channels", make: "Reputed Make", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: "8.2", desc: "200mm x 75 mm X 2mm perforated type Hot dip G.I. cable tray with cover and all accessories", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "8.3", desc: "PVC conduits 32 mm with accessories Lbend/T-bend/Socket", make: "", unit: "Meter", uom: 80, rate: 120, total: 9600, remark: "" },
        { sr: "8.4", desc: "HDPE D195/150", make: "", unit: "Meter", uom: 70, rate: 650, total: 45500, remark: "may require MS pipe for pathway crossing" },
        { sr: "8.5", desc: "HDPE D130/100", make: "", unit: "Meter", uom: 35, rate: 369, total: 12915, remark: "" },
        { sr: "8.6", desc: "HDPE D65/50", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "8.7", desc: "HDPE D50/40", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "8.8", desc: "HDPE D40/30", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" },
        { sr: "8.9", desc: "HDPE D32/25", make: "", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" }
      ]
    },
    {
      num: 9,
      name: "Chemical Earthing & Earth Strip",
      total: 64775,
      items: [
        { sr: 9.1, desc: "Supply, Installation, testing & commissioning of Earthing (Copper & GI) as per IS 3043 standard. It includes conducting testing of earthing pit for grid and pit resistance with required standard equipments, megger. Submission of 2 copies of the test report of the measured resistance, writing the resistance value on the earthing pit cover plate or on the display board.", make: "Ashlok /JMV/OBO/Cape Electric", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: "", desc: "Supply & Installation of Copper Chemical Electrode Rods for Neutral Earthing Complying IS 3043, NBC 2016, IEC 62561-2, IEEE 80, UL 467, BS 7430.Pipe-in-Pipe Technology,suitable for 25kA system, Pipe-in-Pipe Technology,suitable for 25kA Primary Conductor(Inner pipe dia-25NB; Electrode Outer Pipe Dia-50NB Length of Concentric Pipes:3M, Earth enhancing compound complies IEC 62561-7 standard which sets the basic norms for the various tests like leaching test, sulphur test, resistivity test and the corrosion test. Recommended by IEEE 80, NBC 2016, IEC 62561-7,95% pure carbon content, , Retains moisture for undoubtedly long span, 25Kg Bag X 2 Nos as per standard Drawing all complete as per specification & direction of Engineer-In-charge.Supply and Installation of 450 mm X 450 mm Brick Masonry type Earth Pit Chamber with 6 mm thick CI plate Covering (As per IS 3043) & writing pit name on using yellow paint all complete as per standard drawing & direction of Engieer-In-Charge", make: "Ashlok /JMV/OBO/Cape Electric", unit: "Nos", uom: 6, rate: 8000, total: 48000, remark: "" },
        { sr: 9.2, desc: "Supply & laying, jointing, connecting, testing and commissioning of earth strip/copper strip/GI wire for earthing and lightning protection under or above ground complete as per specification for the following . This includes nut bolt & washer at junction/terminals which shall be of SS material only:\nEarthing with 25x3 GI Strip", make: "Ashlok /JMV/Equivalent", unit: "Meter", uom: 55, rate: 305, total: 16775, remark: "" },
        { sr: 9.3, desc: "Supply & laying, jointing, connecting, testing and commissioning of earth strip/copper strip/GI wire for earthing and lightning protection under or above ground complete as per specification for the following . This includes nut bolt & washer at junction/terminals which shall be of SS material only:\nEarthing with 50x6 GI Strip", make: "Ashlok /JMV/Equivalent", unit: "Meter", uom: 1, rate: "", total: 0, remark: "" }
      ]
    },
    {
      num: 10,
      name: "Civil Infra /Excavation & Treanching",
      total: 183375,
      items: [
        { sr: "10.1", desc: "RCC : M20 (SUB & SUPER STRUCTURE)\nProviding and laying Reinforced Cement Concrete of nominal mix M-20 Grade Excluding the cost of formwork and reinforcement , with 20 mm & down size graded crushed stone aggregates in SUB-STRUCTURE and SUPER STRUCTURE below plinth level of all types e.g. foundations, Column etc. and IN SUPER STRUCTURE like grade slabs, or any other specified work by EIC. and in any other structures providing pockets, openings, recesses, chamfering, vibrating, tamping, curing and rendering, to give a smooth and even surface for all depths below and upto plinth level in any position, shape, level and thickness etc. including the cost of materials, labour, tools, tackles, machinery, steel scaffolding / staging, sampling and testing all complete as per specifications and directions of the Engineer-in-charge.", make: "", unit: "", uom: "", rate: "", total: "", remark: "" },
        { sr: "10.2", desc: "RCC Civil foundation 2500l x 2000 W x 500 H (In mm)including PVC pipe for cabling", make: 0, unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "10.3", desc: "RCC Civil foundation 1400l x 700 W x 500 H (In mm)including PVC pipe for cabling for Chargers (60 KW & 30 KW)", make: 0, unit: "Lmsb", uom: 1, rate: 21000, total: 21000, remark: "" },
        { sr: "10.4", desc: "RCC Civil foundation 1100l x 700 W x 600 H (In mm)including PVC pipe for cabling", make: 0, unit: "Lmsb", uom: 5, rate: 18000, total: 90000, remark: "" },
        { sr: "10.5", desc: "RCC Civil foundation 600l x 600 W x 700 H (In mm)including PVC pipe for cabling(CCTV Camera)", make: 0, unit: "Lmsb", uom: 4, rate: 4600, total: 18400, remark: "" },
        { sr: "10.6", desc: "RCC Civil foundation 1000l x 1000 W x 1200 H (In mm)including PVC pipe for cabling(Lightening Pole)", make: 0, unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "10.7", desc: "Meter Room 2.5Mtr*2.5Mtr with 4 column on,Tin Shed and accessories of gate fittings and proper ramp", make: 0, unit: "Lmsb", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "10.8", desc: "Proper Main Hole 750mmx750mm size for cable pilling with ciover", make: "", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "10.9", desc: "all kind of soil in any plan dimension including stacking of serviceable excavated earth, and disposal of surplus and unserviceable material away and outside the boundary limits, after backfilling using serviceable earth, irrespective of lead involved by means of mechanical transport or any other equivalent means, keeping indemnified of any liabilities from statutory/local bodies, all complete as specified & directed. Proper shuttering/support has to be made to support side soil wall and to avoid collapse of soil. Soil to be leveled and neatly dressed complete in all respect as per scope of work, detailed construction design, as per technical specifications and directions of the Engineer-in-charge.\nProper Trenching 750mmx750mm size for cabling", make: "", unit: "Meter", uom: 85, rate: 635, total: 53975, remark: "For HT and LT cabling Trenching" }
      ]
    },
    {
      num: 11,
      name: "Charger Installation & Commissioning",
      total: 25000,
      items: [
        { sr: 11.1, desc: "Scope of Work: The scope work includes receiving ,unloading at site from OEM or shifting of charger from storage area located at site to EV charging station, Supply and installation with suitable Anchor fastening(4Nos)/as per OEM drawings, installation of stand for AC charger(supplied by AC charger OEMs) with proper anchor fastening as per OEM drawings.", make: "", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: 11.2, desc: "60kW DC CC2 DC fast Charger", make: "", unit: "Nos", uom: 5, rate: 5000, total: 25000, remark: "" },
        { sr: 11.3, desc: "30kW DC CC2 DC fast Charger", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: 11.4, desc: "30kW DC CC2 DC fast Charger", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" },
        { sr: 11.5, desc: "12 Slots Battery Swapping Systems( BSS)", make: "", unit: "Nos", uom: 1, rate: "", total: 0, remark: "" }
      ]
    },
    {
      num: 12,
      name: "Parking Painting/Wall Painting & Development",
      total: 55000,
      items: [
        { sr: 12.1, desc: "Painting of parking area with permanent Floor Coat Epoxy paint 2mm layer and painting of logo including stenciling of letters as per design.\nPaint: Indigo 4L Platinum series floor coat emulsion or equivalent: Blue colour for parking area and white colour for boundary of parking.\nStandard size of 4W parking: 2.5X5m\nNote: Rate is inclusive painting of the parking area with standard logo and demarcation.", make: "", unit: "", uom: "", rate: "", total: 0, remark: "" },
        { sr: 12.2, desc: "Paver supply & laying 2500 mmx6000 mm", make: "", unit: "Sqft", uom: 0, rate: 155, total: 0, remark: "For 1-Parking Development" },
        { sr: 12.3, desc: "Parking marking / layout epoxy paint 2500mmx5000mm\nCase 1: Line marking for parking bays on concrete surfaces\n- Surface cleaning.1st topcoat: Nippon Reflective Road Line Paint (Yellow), 35 µm Dry Film Thickness (DFT) (consumption rate: 0.1 liter/m²).\n- 2nd topcoat: Nippon Reflective Road Line Paint (Yellow), 35 µm DFT (consumption rate: 0.1 liter/m²).\nCase 2: Line marking for parking bays on asphalt surfaces\n- Surface cleaning.1st topcoat: Nippon Reflective Road Line Paint (Yellow), 35 µm DFT (consumption rate: 0.2 liter/m²).\n- 2nd topcoat: Nippon Reflective Road Line Paint (Yellow), 35 µm DFT (consumption rate: 0.2 liter/m²).\nor approved equivalent.", make: "", unit: "Nos", uom: 10, rate: 5500, total: 55000, remark: "" },
        { sr: 12.4, desc: "Painting of back wall area with permanent Coat Epoxy paint 2mm layer and painting of logo including stenciling of letters as per design.\nPaint: Indigo 4L Platinum series floor coat emulsion or equivalent: Blue colour for parking area and white colour for logo. Standard size.", make: "", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "Size not mention I unit = 2000Mx5000M" }
      ]
    },
    {
      num: 13,
      name: "Electrical Safety Equipment and Fire Extinguisher",
      total: 58450,
      items: [
        { sr: 13.1, desc: "Providing and erecting printed instruction chart(Shock Treatment Chart) both in English & REGIONAL LANGUAGE & duly framed out on glass for treatment of person suffering from Electric shock. The board should be 450 x 300 mm.", make: "Reputed Make", unit: "Nos", uom: 2, rate: 3075, total: 6150, remark: "" },
        { sr: "", desc: "Providing and fixing user instruction and safety display board near EV charging dispenser, fabricated from ACP or powder-coated MS sheet of size approx. 600x900 mm, with digitally printed and laminated vinyl or UV-printed\nsurface showing charging steps, safety DOs & DON’Ts, QR code, and branding, mounted on SS stand or wall as per site condition, including civil fdn (.25mx.25mx.5m) with base plate, j bolts, all materials, hardware, supports,\nand installation complete as per drawing and direction of Engineer in charge.", make: "Reputed Make", unit: "Nos", uom: 4, rate: 4500, total: 18000, remark: "MS Pipe approved" },
        { sr: "", desc: "Supplying & Erecting conventional type CO2 fire extinguishers of ISI approved of 4.5 kgs -Kennex Make. Fire extinguisher shall come with appropriate size of stand.", make: "Reputed Make", unit: "Nos", uom: 6, rate: 5000, total: 30000, remark: "" },
        { sr: "", desc: "Outdoor fire extinguisher cabinet, dimensions: 500x820x200mm", make: "Reputed Make", unit: "Nos", uom: 1, rate: 0, total: 0, remark: "" },
        { sr: "", desc: "Supply and fixing of Medium Voltage Danger Boards of 200mmx250mm with 1.5mm thick MS sheet on ACDB Panel", make: "Reputed Make", unit: "Nos", uom: 2, rate: 550, total: 1100, remark: "" },
        { sr: 13.2, desc: "Rubber Mat 11 KV Grade -\n(2MX1M Size)Supply and Fixing of Electrical insulating mats made of PVC Elastomer 3mm Thick & 1 mtr wide near switchboards, etc as per direction of Engineer In charge. Mat should conform to IS 15652 Class A - suitable for safe working voltage of upto 11 kV. Test certificate to be provided with supply. Mat's top Surface should be Antiskid Dotted & Bottom Surface should be Textured for Floor Grip. Mat's top Surface should be Antiskid Dotted & Bottom Surface should be Textured for Floor Grip.", make: "Reputed Make", unit: "Nos", uom: 1, rate: 3200, total: 3200, remark: "" }
      ]
    },
    {
      num: 14,
      name: "Safety Bollard/Crash Guard",
      total: 95000,
      items: [
        { sr: 14.1, desc: "Providing and installing safety bollard / crash guard fabricated from heavy-duty MS pipe of 100 mm diameter, minimum 6 mm thick, bent as per site layout (U-shape or L-shape or circular), height above ground 900 mm, embedded in concrete footing of size 300 mm x 300 mm x 600 mm deep, with adequate reinforcement and filled with M-20 grade concrete. Bollard to be painted with yellow & black /as per approved color reflective bands using 2 coats of enamel paint over one coat of primer. Including excavation, formwork, concrete, backfilling, painting, and all materials, labour and tools required to complete the job as per specifications and drawings.\nNote: Anchor bolts to be grouted using Hilti/Equivalent chemical or cementitious grout. Foundations should be isolated from charger plinth pad to prevent transfer of impact load.", make: "Reputed Make", unit: "Nos", uom: 10, rate: 7000, total: 70000, remark: "" },
        { sr: 14.2, desc: "wheel Stopper-Dimensions: L550 x W150 x H100 mm.Material:\n- Rubber-plastic composite\n- Reflective strips included with the product.", make: "Reputed Make", unit: "Nos", uom: 20, rate: 1250, total: 25000, remark: "" }
      ]
    },
    {
      num: 15,
      name: "Signages and Branding",
      total: 64000,
      items: [
        { sr: 15.1, desc: "Providing and erecting printed Signages duly framed out on The board should be as per design.\nD113.5 x 2.0mm Thick Camera Pole, H=3600mm with 200x200x10mm Mounting Bracket, hot dip galvanized", make: "Reputed Make", unit: "Nos", uom: 2, rate: 32000, total: 64000, remark: "" }
      ]
    },
    {
      num: 16,
      name: "CCTV/ Security",
      total: 48000,
      items: [
        { sr: 16.1, desc: "D65 x 2.0MM Thick Camera Pole, H=3000mm with 300x300x5mm Mounting Bracket, hot dip galvanized", make: "Reputed Make", unit: "Nos", uom: 4, rate: 6000, total: 24000, remark: "" },
        { sr: "", desc: "Supply and instalaltion of CCTV -5MP Camera", make: "CP-Plus/Hikvision", unit: "Nos", uom: 4, rate: 6000, total: 24000, remark: "" }
      ]
    },
    {
      num: 17,
      name: "Miscellaneous",
      total: 35000,
      items: [
        { sr: 17.1, desc: "Misc items -Tape,Cable Tie,Screw and Transportation of Material", make: "", unit: "Lmsb", uom: 1, rate: 30000, total: 30000, remark: "" },
        { sr: "", desc: "Site Survey,SLD and layout of location drawing", make: "", unit: "Lmsb", uom: 1, rate: 5000, total: 5000, remark: "" },
        { sr: "", desc: "", make: "", unit: "", uom: "", rate: "", total: 1590295, remark: "" }
      ]
    }
  ]
};

export const SITE_LABELS: Record<string, string> = {
  "vst-joatwara": "VST Joatwara"
};

export const DEFAULT_SITE_LOCATION = "Joatwara Rd, Jaipur, Rajasthan, India";

export const DOC_CHECKLIST: ChecklistData = {
  pre_work: {
    title: "Before Starting Work (Mandatory)",
    items: [
      { text: "Approved site layout drawing" },
      { text: "Site Marking & Layout Verification" },
      { text: "Approved electrical drawing" },
      { text: "Approved Site survey report" },
      { text: "Approved BOQ" },
      { text: "Self Declaration Form submitted" },
      { text: "Appendix Agreement signed" }
    ]
  },
  discom_company: {
    title: "DISCOM Checklist — Company Documents",
    items: [
      { text: "V-Green Authorized Person / Director Aadhaar Card" },
      { text: "PAN Card" },
      { text: "MOA/AOA (Memorandum & Articles of Association)" },
      { text: "Company Registration Documents" },
      { text: "State GST Certificate" },
      { text: "Bank Details / Cancelled Cheque" },
      { text: "Authorization Letter / Board Resolution (If required)" }
    ]
  },
  discom_site: {
    title: "DISCOM Checklist — Site Documents",
    items: [
      { text: "Property Owner Deed / Ownership Proof" },
      { text: "Property Owner NOC (No Objection Certificate)" },
      { text: "Lease Agreement / Rent Agreement (If Applicable)" },
      { text: "Site Address Proof & Location Details" }
    ]
  },
  discom_technical: {
    title: "DISCOM Checklist — Technical Documents",
    items: [
      { text: "EV Charger Technical Datasheet" },
      { text: "Panel Technical Datasheet" },
      { text: "Transformer Technical Datasheet" },
      { text: "RMU / VCB Technical Datasheet" },
      { text: "Load Calculation & Single Line Diagram (SLD)" },
      { text: "Any Other Required Technical Specifications" }
    ]
  },
  execution_photos: {
    title: "Site Execution — Geotagged Photo Checkpoints",
    items: [
      { text: "Site Survey — all required geotagged photographs", photo: true },
      { text: "Paint work — empty paint cans geotagged photo", photo: true },
      { text: "Civil work photos (geotagged, Civil Form submission)", photo: true },
      { text: "Foundation curing geotagged photos", photo: true },
      { text: "Chemical earthing pit digging geotagged photo", photo: true },
      { text: "Insulation Resistance (IR) test — geotagged photos", photo: true },
      { text: "Cable trench closing — geotagged photos", photo: true },
      { text: "Charger delivery inspection photos (all sides, pre-install)", photo: true },
      { text: "Charger installation photos (post-installation)", photo: true },
      { text: "Charger power-ON & testing geotagged photo/video", photo: true },
      { text: "Vehicle trial charging geotagged photos", photo: true },
      { text: "HOTO geotagged photos (all angles)", photo: true }
    ]
  },
  final_handover: {
    title: "Final Documents Handover (Vendor → Setup Team)",
    items: [
      { text: "BOQ Soft copy" },
      { text: "Site Survey Report" },
      { text: "Appendix file" },
      { text: "DISCOM DN Payment Receipt (If any)" },
      { text: "Approved Site Layout Drawing showing ACDB and EVCS locations" },
      { text: "Approved Electrical Panel Drawing" },
      { text: "Civil Work Inspection Report with Geo-Tagged Photos", photo: true },
      { text: "Cable Continuity Test Report with Geo-Tagged Photos", photo: true },
      { text: "Voltage Test Report with Geo-Tagged Photos", photo: true },
      { text: "Insulation Resistance Test Report with Geo-Tagged Photos", photo: true },
      { text: "Earthing Resistance Test Report with Geo-Tagged Photos", photo: true },
      { text: "HOTO (Handover Takeover) checklist" },
      { text: "Final HOTO Photo with Geo-Tagged Photos", photo: true },
      { text: "Site Inspection Final Report Email Confirmation" },
      { text: "Tax invoice" }
    ]
  }
};
