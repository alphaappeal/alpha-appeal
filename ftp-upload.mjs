import * as ftp from "basic-ftp"
import dotenv from "dotenv"

dotenv.config({ path: '.env.local' });

async function upload() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        console.log("Connecting to FTP...")
        await client.access({
            host: process.env.FTP_HOST || "ftp.alphaappeal.co.za",
            user: process.env.FTP_USER || "u248051488.hostingeralphakey",
            password: process.env.FTP_PASSWORD || "@Mus1c@ppe@L",
            secure: false
        })
        console.log("Connected. Uploading dist folder to " + (process.env.FTP_REMOTE_DIR || "/public_html"));
        
        await client.ensureDir(process.env.FTP_REMOTE_DIR || "/public_html");
        await client.clearWorkingDir();
        await client.uploadFromDir("dist");
        
        console.log("Upload completed successfully.");
    }
    catch(err) {
        console.log("FTP Error: ", err)
    }
    client.close()
}

upload()
