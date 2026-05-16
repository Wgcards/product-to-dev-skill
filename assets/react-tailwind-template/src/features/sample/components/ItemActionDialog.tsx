import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
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
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>确认流转状态</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {item
            ? `确认将「${item.name}」流转到下一阶段？此操作会刷新当前事项列表。`
            : '请选择需要流转的事项。'}
        </DialogContentText>
        <TextField
          label="流转备注"
          value={operatorNote}
          required
          multiline
          minRows={3}
          fullWidth
          margin="normal"
          error={Boolean(operatorNoteError)}
          helperText={operatorNoteError ?? '用于记录本次流转依据，最多 200 字。'}
          disabled={loading}
          onChange={(event) => onOperatorNoteChange(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={!item || loading}>
          {loading ? '处理中' : '确认流转'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
