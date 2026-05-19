import * as ftp from "basic-ftp"
import dotenv from "dotenv"

dotenv.config({ path: '.env.local' });

async function upload() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        console.log("Connecting to FTP...")
        let host = process.env.FTP_HOST || "ftp.alphaappeal.co.za";
        host = host.replace(/^ftps?:\/\//, "");
        await client.access({
            host: host,
            user: process.env.FTP_USER || "u248051488.hostingeralphakey",
            password: process.env.FTP_PASSWORD || "@Mus1c@ppe@L",
            secure: false
        })
        console.log("Connected. Uploading dist folder to " + (process.env.FTP_REMOTE_DIR || "/public_html"));
        
        await client.ensureDir(process.env.FTP_REMOTE_DIR || "/public_html");
        // Bypassing clearWorkingDir to avoid errors with un-deletable remote files
        await client.uploadFromDir("dist");
        
        console.log("Upload completed successfully.");
    }
    catch(err) {
        console.log("FTP Error: ", err)
    }
    client.close()
}

upload()
