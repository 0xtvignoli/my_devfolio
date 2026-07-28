'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Translations } from '@/lib/types';

interface LabConfirmDialogsProps {
  translations: Translations;
  showRollbackConfirm: boolean;
  setShowRollbackConfirm: (open: boolean) => void;
  onRollbackConfirm: () => void;
  showChaosConfirm: boolean;
  setShowChaosConfirm: (open: boolean) => void;
  pendingChaosScenario: string | null;
  onChaosConfirm: () => void;
  onChaosCancel: () => void;
}

export function LabConfirmDialogs({
  translations,
  showRollbackConfirm,
  setShowRollbackConfirm,
  onRollbackConfirm,
  showChaosConfirm,
  setShowChaosConfirm,
  pendingChaosScenario,
  onChaosConfirm,
  onChaosCancel,
}: LabConfirmDialogsProps) {
  const t = translations.lab;

  return (
    <>
      <AlertDialog open={showRollbackConfirm} onOpenChange={setShowRollbackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.rollbackTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.dialogs.rollbackDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.dialogs.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRollbackConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.rollback}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showChaosConfirm} onOpenChange={setShowChaosConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.chaosTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.dialogs.chaosDescription.replace('{scenario}', pendingChaosScenario ?? '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onChaosCancel}>{t.dialogs.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onChaosConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.dialogs.chaosTitle}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
