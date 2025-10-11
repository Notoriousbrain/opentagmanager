"use client";

import { useState } from "react";
import { Label, Input, Button, Card, CardContent } from "@otm/ui";

export function OrgSwitcher() {
  const [orgId, setOrgId] = useState<string>("");

  // store selection (localStorage for now). Your TRPC calls will read this.
  const apply = () => {
    if (!orgId.trim()) return;
    localStorage.setItem("otm.orgId", orgId.trim());
    // Fire a custom event so panels can re-read
    window.dispatchEvent(new Event("otm:org-changed"));
  };

  return (
    <Card className="w-full max-w-xs border-black/10 text-white">
      <CardContent className="flex items-end gap-2 p-3">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="orgId" className="text-xs">
            Org ID
          </Label>
          <Input
            id="orgId"
            placeholder="org_123..."
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="h-9 rounded-lg"
          />
        </div>
        <Button variant="outline" onClick={apply} className="h-9 rounded-lg">
          Use
        </Button>
      </CardContent>
    </Card>
  );
}
