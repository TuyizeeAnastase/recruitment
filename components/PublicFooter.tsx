import { companyName } from "@/lib/company";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#0a4a7c]/15 bg-[#0a4a7c] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7dce9e]">
            {companyName}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            BANK OF AFRICA RWANDA is a member of BANK OF AFRICA Group. We serve individuals,
            businesses, and institutions with integrity, professionalism, and a commitment to
            sustainable growth in Rwanda.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7dce9e]">Careers</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            We are an equal opportunity employer. All applications are treated in confidence and
            used only for recruitment. Shortlisting is based on skills, experience, and the
            requirements of each role.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7dce9e]">Contact</p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            Human Resources
            <br />
            Head Office, Kigali, Rwanda
            <br />
            Placeholder text — replace with the official address, phone, and website when ready.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/60">
        © {year} {companyName}. All rights reserved.
      </div>
    </footer>
  );
}
