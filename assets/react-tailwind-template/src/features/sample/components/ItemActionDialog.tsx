import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ISampleItem } from '@/features/sample/types/sample';

/*
 * 事项流转确认弹窗参数。
 */
export interface IItemActionDialogProps {
  /*
   * 弹窗是否打开。
   */
  open: boolean;
  /*
   * 当前等待流转的事项。
   */
  item: ISampleItem | null;
  /*
   * 确认按钮是否展示处理中状态。
   */
  loading: boolean;
  /*
   * 流转备注输入值。
   */
  operatorNote: string;
  /*
   * 流转备注校验错误，展示在 MUI TextField 下方。
   */
  operatorNoteError: string | null;
  /*
   * 关闭弹窗。
   */
  onClose: () => void;
  /*
   * 更新流转备注。
   */
  onOperatorNoteChange: (value: string) => void;
  /*
   * 确认流转事项状态。
   */
  onConfirm: () => void;
}

/*
 * 使用 MUI Dialog 承载危险或状态流转类确认，替代浏览器原生 confirm。
 */
export function ItemActionDialog({
  open,
  item,
  loading,
  operatorNote,
  operatorNoteError,
  onClose,
  onOperatorNoteChange,
  onConfirm,
}: IItemActionDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('sample.dialog.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {item
            ? t('sample.dialog.description', { itemName: item.name })
            : t('sample.dialog.noItem')}
        </DialogContentText>
        <TextField
          label={t('sample.dialog.noteLabel')}
          value={operatorNote}
          required
          multiline
          minRows={3}
          fullWidth
          margin="normal"
          error={Boolean(operatorNoteError)}
          helperText={operatorNoteError ?? t('sample.dialog.noteHelper')}
          disabled={loading}
          onChange={(event) => onOperatorNoteChange(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('sample.action.cancel')}
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={!item || loading}>
          {loading ? t('sample.action.processing') : t('sample.dialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
