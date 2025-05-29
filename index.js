import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Get the current Directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve Bootstrap
app.use(
  "/bootstrap",
  express.static(__dirname + "/node_modules/bootstrap/dist")
);

// Include folder containing the static files.
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});

// Posts Data
const posts = {
  // Toyota Original Parts
  "toyota-original-parts": {
    title: "Toyota Original Parts",
    date: "May 2025",
    category: "Parts",
    readTime: "3 min read",
    image:
      "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748372263/parts.png",
    description:
      "How to decode Toyota Part Numbers and buy genuine parts online without OVERPAYING at the Dealership.",
    content: `
        <p>Original Toyota parts are specifically designed to fit and function perfectly in your vehicle. They meet Toyota’s rigorous quality standards and ensure long-term reliability and performance.</p>

        <p>While many people associate OEM parts with expensive dealership visits, there are trustworthy online options that source directly from dealerships. These include:</p>
        <ul>
            <li><a href="https://parts.toyota.com" target="_blank">parts.toyota.com</a></li>
            <li><a href="https://parts.lexus.com" target="_blank">parts.lexus.com</a></li>
            <li><a href="https://parts.olathetoyota.com" target="_blank">Olathe Toyota Parts Center</a> — a dealership in the U.S. offering nationwide shipping.</li>
        </ul>

        <h3>Understanding Toyota Part Numbers</h3>
        <p>Toyota part numbers follow a specific format that reveals useful information:</p>
        <ul>
            <li><strong>12345</strong>-12345: Standard format. The first five digits (PNC) are the Part Number Code, shared across various models.</li>
            <li>12345-12345-<strong>B3</strong>: The suffix (like B3) may indicate color or trim variation.</li>
            <li>12345-12345-<strong>84</strong>: The suffix (84) indicates a remanufactured part, certified by Toyota — often a more affordable and still reliable option.</li>
        </ul>

        <h3>Special Service Kits</h3>
        <p>Parts beginning with <strong>0400*-*****</strong> refer to full repair kits. These kits often include everything needed for a specific repair, making them more cost-effective and complete than ordering each part individually.</p>

        <h3>Other Toyota Part Variants</h3>
        <ul>
            <li><u><strong>12345-WA123</strong>:</u> BW-type parts.</li>
            <li><strong>12345-AZ123</strong>: Economical parts designed to compete with aftermarket offerings.</li>
            <li><strong>SU123-12345</strong>: Subaru parts supplied through Toyota's system.</li>
            <li><strong>12345-WB123</strong>: Mazda parts.</li>
            <li><strong>G1234-12345</strong>: Hybrid system components.</li>
            <li><strong>YZZ</strong>: Often found in maintenance parts such as filters or fluids.</li>
        </ul>

        <h3>Important Reminder</h3>
        <p>You can only buy a true Toyota original part from a dealership. Even if you buy online, the seller should clearly state which dealership supplies the part. This ensures you're not getting counterfeit or inferior aftermarket components labeled as OEM.</p>

        <p>When it comes to maintaining your vehicle's performance, safety, and value, sticking with genuine Toyota parts is always the smart move.</p>
        `,
  },

  // Toyota Power Steering
  "toyota-power-steering": {
    title: "Toyota Power Steering",
    date: "May 2025",
    category: "Common Issues",
    readTime: "4 min read",
    image:
      "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748487114/power-steering.png",
    description:
      "Toyota Power Steering problems explained: when to replace parts and why leaks aren’t always urgent",
    content: `
        <p>Toyota vehicles use power steering systems designed for long-term performance and driver comfort. Depending on the model and year, these systems can be hydraulic or electric. Here's what you need to know, especially if you're maintaining or troubleshooting an older Toyota like the RAV4.</p>

        <h3>Hydraulic Power Steering System</h3>
        <p>Hydraulic systems use pressurized fluid to assist with steering. The main components include:</p>
        <ol>
            <li><strong>Power Steering Reservoir:</strong> Stores the fluid and connects to two hoses:
            <ul>
                <li><strong>Pressure Line:</strong> Sends fluid to the power steering pump.</li>
                <li><strong>Return Line:</strong> Returns fluid from the rack and pinion.</li>
            </ul>
            </li>
            <li><strong>Power Steering Pump:</strong> Pressurizes the fluid and delivers it to the rack and pinion for steering assist.</li>
            <li><strong>Rack and Pinion:</strong> Directs the pressurized fluid to help move the wheels when you turn the steering wheel. A valve inside directs the flow, and fluid returns to the reservoir through the return line.</li>
        </ol>

        <h3>Common Wear Areas & Maintenance Tips</h3>

        <h4>🛞 Intermediate Shaft Noise</h4>
        <p>The intermediate shaft can sometimes cause a <em>clunk-clunk</em> noise when turning. This is often due to dry joints between the pinion and the steering shaft. It’s not dangerous — just an annoyance.</p>

        <h4>🛠 Power Steering Pump</h4>
        <p>These are highly durable components in Toyotas and rarely fail under normal driving conditions.</p>

        <h4>🧰 Rack and Pinion</h4>
        <ul>
            <li>The most frequent issue is torn rubber seals or damaged boots, leading to leaks.</li>
            <li>If seals keep failing after replacement, it’s best to replace the entire rack and pinion assembly. OEM parts are expensive, but quality aftermarket units with warranty are a smart alternative.</li>
            <li>Leaks near the shaft at the back of the rack and pinion are usually <strong>low-pressure leaks</strong> — not urgent and can take years to cause real damage.</li>
        </ul>

        <h4>🪛 Power Steering Return Line</h4>
        <p>This line is a known leak point in older models. An aftermarket replacement is generally sufficient and much cheaper than OEM.</p>

        <h4>🔩 Tie Rod Issue (RAV4 2006–2012)</h4>
        <p>The inner tie rod in this model is a common failure point. Toyota doesn't sell it separately — you’d have to buy the entire rack and pinion assembly. Fortunately, reliable aftermarket tie rods are available and recommended for this repair.</p>

        <h4>🧱 Mount Bushings</h4>
        <p>When bushings wear out or break, the vehicle may pull or drift side-to-side at low speeds. This is a safety concern and should be addressed promptly.</p>

        <h3>Electric Power Steering</h3>
        <p>Electric systems are increasingly common in newer Toyotas. According to experts, Toyota’s electric steering systems are exceptionally well-made and rarely cause problems.</p>

        <p>Whether your vehicle uses hydraulic or electric power steering, keeping an eye on known wear points like seals, shafts, and bushings can extend the life of your steering system and improve safety.</p>
        `,
  },

  "toyota-suspension-replacement": {
    title: "When and How to Replace Toyota Suspension Components",
    date: "May 2025",
    category: "Repairs",
    readTime: "4 min read",
    image:
      "https://res.cloudinary.com/dcco4yq4l/image/upload/v1748487407/suspension.png",
    description:
      "Should you change struts, shocks, or springs on your Toyota? Learn when it's necessary, which parts to avoid, and why OEM components are worth it.",
    content: `
    <p>Your Toyota's suspension system plays a critical role in both comfort and safety. Whether you're dealing with worn struts, noisy mounts, or sagging springs, knowing what to replace — and when — can save you money and prevent unnecessary repairs.</p>

    <h3>Struts</h3>
    <p>Struts are essential for absorbing road impacts and stabilizing your vehicle. But contrary to popular belief, <strong>you only need to replace them when there's a clear problem</strong>.</p>
    <ul>
      <li><strong>Leaking Below the Mid Plate:</strong> If fluid is leaking from below the middle section of the strut and you're hearing unusual noises, it’s time for a replacement.</li>
      <li><strong>Leaking Above the Mid Plate:</strong> A small amount of fluid above the middle plate doesn’t necessarily mean the strut has failed. Monitor it before rushing to replace.</li>
      <li><strong>Important Tip:</strong> Always use a <strong>new original Toyota nut</strong> when installing a new strut to ensure proper torque and fitment.</li>
    </ul>

    <h3>Shock Absorbers</h3>
    <p>Shock absorbers reduce bounce and maintain tire contact with the road. Like struts, they should only be replaced when they're actually worn out.</p>
    <ul>
      <li>If they're leaking <strong>below the halfway point</strong> and causing noise, they should be replaced.</li>
      <li>If the leak is minor and not accompanied by performance issues, monitor them rather than replacing prematurely.</li>
    </ul>

    <h3>Springs</h3>
    <p>Springs rarely need replacement unless:</p>
    <ul>
      <li>They're visibly <strong>cracked or broken</strong>.</li>
      <li>The car sits <strong>noticeably lower</strong> than normal due to old, worn-out springs.</li>
    </ul>

    <h3>Strut Mounts</h3>
    <p>Strut mounts are a common source of noise in aging suspensions. Always use <strong>OEM (original)</strong> mounts when replacing them.</p>
    <ul>
      <li>If the rubber inside the mount is crushed or has come loose, it can cause clunking sounds and should be replaced immediately.</li>
    </ul>

    <h3>Quick Struts vs. OEM Component Replacement</h3>
    <p><strong>Avoid using quick struts</strong> whenever possible. These pre-assembled units often use lower-quality parts and may not match your Toyota's original ride quality.</p>
    <p>The best approach is to replace only the parts that are actually worn or broken — but this requires a skilled mechanic with the proper tools to compress and disassemble the spring and strut assembly safely.</p>

    <p>In short, don't fall into the trap of replacing everything at once. With careful inspection and OEM parts, you can restore your Toyota's suspension performance the right way.</p>
  `,
  },
};

// Main Page
app.get("/", (req, res) => {
  res.render("index", { posts });
});

// Route to render a specific post
app.get("/posts/:slug", (req, res) => {
  const slug = req.params.slug;
  const post = posts[slug]; // access object by key

  if (!post) return res.status(404).send("Post not found");

  res.render("post", { post }); // render post.ejs with the post data
});
