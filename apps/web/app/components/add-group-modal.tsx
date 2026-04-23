import {
  AlertDialog,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Spinner,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import { Check, Component, Plus } from "lucide-react";
import { useMesh } from "./mesh-provider";
import { useFormik } from "formik";
import * as yup from "yup";
import { useCallback, useEffect, useState } from "react";
import { toastError } from "../helpers/error";

const schema = yup.object().shape({
  address: yup
    .string()
    .matches(
      /^[cC][0-9a-fA-F]{3}$|^[dD][0-9a-fA-F]{3}$|^[eE][0-9a-fA-F]{3}$|^[fF][0-9a-fA-F]{3}$/,
      "Address must be a hexadecimal value in range C000 - FEFF",
    )
    .required("Address is not set"),
  name: yup.string().required().min(1),
  parentGroup: yup.string().required(),
});
export function AddGroupModal() {
  const mesh = useMesh();
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormik({
    initialValues: {
      name: "New Group",
      address: "",
      parentGroup: "Root",
    },
    validationSchema: schema,
    onSubmit: async (data) => {
      return mesh
        .addGroup({
          name: data.name,
          address: data.address,
        })
        .then(() => {
          toast("Successfully added group", { variant: "success" });
          setIsOpen(false);
        })
        .catch((error) => {
          console.error(error);
          toastError(error);
        });
    },
  });

  useEffect(() => {
    const setFieldValue = form.setFieldValue;
    setFieldValue("address", mesh.nextAvailableGroupAddress?.hex ?? "", true);
  }, [form.setFieldValue, mesh.nextAvailableGroupAddress?.hex]);

  const reset = useCallback(() => {
    setTimeout(() => {
      const resetForm = form.resetForm;
      resetForm();
      const setFieldValue = form.setFieldValue;
      setFieldValue("address", mesh.nextAvailableGroupAddress?.hex ?? "", true);
    }, 250);
  }, [form.resetForm, form.setFieldValue, mesh.nextAvailableGroupAddress?.hex]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button>
        <Plus />
        Add Group
      </Button>
      <AlertDialog.Backdrop variant="blur">
        <AlertDialog.Container size="lg">
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading className="flex gap-2">
                <Component size={24} />
                <div>
                  Add group
                  <p className="text-xs text-muted">Add groups to your network.</p>
                </div>
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <Form validationErrors={form.errors} onSubmit={form.handleSubmit}>
              <Surface variant="secondary" className="rounded-xl flex flex-col gap-2 my-6">
                <AlertDialog.Body className="flex py-2 flex-col p-4 gap-4">
                  <TextField isRequired name="name" type="text">
                    <Label>Name</Label>
                    <Description>e.g. Lights</Description>
                    <Input value={form.values.name} onChange={form.handleChange} />
                    <FieldError />
                  </TextField>
                  <TextField isRequired name="address" type="text">
                    <Label>Address</Label>
                    <Description>Hexadecimal value in range C000 - FEFF.</Description>
                    <Input
                      value={form.values.address}
                      onChange={form.handleChange}
                      placeholder="Address"
                    />
                    <FieldError />
                  </TextField>
                  <ListBox aria-label="parent-group" selectionMode="none">
                    <ListBox.Item
                      textValue={form.values.parentGroup}
                      className="flex flex-row justify-between"
                    >
                      <Label>Parent Group</Label>
                      <p>{form.values.parentGroup}</p>
                    </ListBox.Item>
                  </ListBox>
                </AlertDialog.Body>
              </Surface>
              <AlertDialog.Footer>
                <Button isPending={form.isSubmitting} isDisabled={!form.isValid} type="submit">
                  {form.isSubmitting ? <Spinner color="current" /> : <Check />}
                  Create Group
                </Button>
              </AlertDialog.Footer>
            </Form>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
