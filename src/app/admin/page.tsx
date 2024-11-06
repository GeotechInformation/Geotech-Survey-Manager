// Admin Page tsx

"use client";

import Header from "@/components/layout/Header";
import { useAuth } from "@/components/providers/AuthProvider";
import { SurveyDataProvider } from "@/components/providers/SurveyDataProvider";
import LoadMaster from "@/components/survey/admin/LoadMaster";
import RenameCollection from "@/components/survey/admin/RenameCollection";
import ToolbarAdminConsole from "@/components/toolbar/ToolbarAdminConsole";
import { getUserValue } from "@/services";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ActionType = 'none' | 'rename' | 'load';

function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [curAction, setCurAction] = useState<ActionType>('none');

  useEffect(() => {
    if (!user) return;

    const checkAuth = async () => {
      try {
        const isAdmin = await getUserValue(user.uid, 'admin');
        if (!isAdmin) router.push("/");
      } catch (error) {
        console.error("Error Authenticating User as Admin");
        router.push("/");
      }
    };

    checkAuth();
  }, [user]);


  return (
    <div className="px-4 mb-8">
      <Header />
      <ToolbarAdminConsole setCurAction={setCurAction} />

      {curAction === 'rename' && (<RenameCollection />)}
      {curAction === 'load' && <LoadMaster />}
    </div>
  );
};


export default function AdminPage() {
  return (
    <SurveyDataProvider>
      <Admin />
    </SurveyDataProvider>
  );
}

