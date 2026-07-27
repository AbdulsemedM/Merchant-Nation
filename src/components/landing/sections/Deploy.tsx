import Link from "next/link";
import { DEPLOY_URL } from "../landing-content";

export function Deploy() {
  return (
    <section id="deploy">
      <div className="wrap">
        <div className="eyebrow">Deploy</div>
        <h2>Ready to deploy?</h2>

        <div className="deploy-grid">
          <div className="deploy-copy">
            <p>
              Sign in with the credentials your administrator issued, and your first mission is
              already waiting on the map.
            </p>
            <Link href="/login" className="btn btn-ink">
              Sign in to command
            </Link>
          </div>

          <div className="deploy-card">
            <div className="deploy-qr">
              <img src="/images/landing/img-7.png" alt="QR code to open Merchant Nation Command" />
            </div>
            <div className="deploy-meta">
              <div className="l1">Scan to open</div>
              <div className="l2">Merchant Nation Command</div>
              <div className="l3">{DEPLOY_URL}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
