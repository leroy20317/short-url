import { RedoOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { App, Col, DatePicker, Flex, Form, Popconfirm, Row } from 'antd';
import { Button, Input, Modal, Space, Table, Typography } from 'antd';
import type { ElementRef } from 'react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRequest, useResponsive } from 'ahooks';
import axios from 'axios';

type DataType = {
  key: string;
  short: string;
  original: string;
  clicks: number;
  expired: string;
};
const randomKey = (length = 6) => {
  const characters = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  return [...Array(length)].reduce((prev) => {
    return prev + characters.charAt(Math.floor(Math.random() * characters.length));
  }, '');
};
const EditModal = forwardRef<
  {
    edit: (data: { type: 'edit' | 'add'; key?: string }) => void;
    delete: (key: string) => Promise<any>;
  },
  { refresh: () => void; list?: DataType[] }
>(({ refresh, list }, ref) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const { loading, runAsync } = useRequest((data) => axios.post('/api/shorten/edit', data), {
    manual: true,
    onSuccess: (res) => {
      if (res.data.status === 'success') {
        message.success('操作成功！');
        setModalOpen(false);
        setTimeout(refresh, 10);
        return;
      }
      message.error(res.data.message || '操作失败，请重试！');
    },
    onError: (e: any) => {
      if (e.response.status === 401) {
        message.error('账号错误，重新登录！');
        window.location.reload();
        return;
      }
    },
  });

  useImperativeHandle(ref, () => ({
    edit: ({ type, key }) => {
      setModalOpen(true);
      setEdit(type === 'edit');
      if (key) {
        const current = list?.find((ele) => ele.key === key);
        if (current)
          form.setFieldsValue({
            key: current.key,
            original: current.original,
            expired: current.expired ? dayjs(current.expired) : undefined,
          });
      }
    },
    delete: (key) => {
      return runAsync({ type: 'delete', key });
    },
  }));

  return (
    <Modal
      open={modalOpen}
      onCancel={() => setModalOpen(false)}
      okText={isEdit ? 'Edit' : 'Create'}
      destroyOnClose
      okButtonProps={{ autoFocus: true, htmlType: 'submit', loading }}
      modalRender={(dom) => (
        <Form<{ key: string; expired?: Dayjs; original: string }>
          layout="vertical"
          form={form}
          clearOnDestroy
          requiredMark={false}
          onFinish={({ key, original, expired }) => {
            const data = {
              type: isEdit ? 'edit' : 'add',
              key,
              short: `${window.location.origin}/${key}`,
              original,
              expired: expired?.format('YYYY-MM-DD HH:mm') || '',
            };
            console.log('data', data, expired);
            if (!isEdit) {
              console.log('isEdit', isEdit, key, list);
              const current = list?.find((ele) => ele.key === key);
              if (current) {
                Modal.confirm({
                  title: `Whether to replace an existing ${key}`,
                  content: (
                    <>
                      The original link is：
                      <Typography.Link href={current.original} target="_blank" rel="noreferrer">
                        {current.original}
                      </Typography.Link>
                    </>
                  ),
                  okText: 'Confirm',
                  onOk: () => {
                    return runAsync(data);
                  },
                });
                return;
              }
            }
            return runAsync(data);
          }}
        >
          {dom}
        </Form>
      )}
    >
      <Form.Item noStyle name="edit" />
      <Row>
        <Col span={11}>
          <Form.Item
            name="key"
            label="Short Key"
            rules={[
              { required: true, message: 'Please fill the short key!' },
              {
                pattern: /^\w[\w_-]{2,}$/,
                message: 'Please fill in the correct short key!',
              },
            ]}
          >
            <Input
              readOnly={isEdit}
              maxLength={8}
              suffix={
                !isEdit && (
                  <Typography.Link>
                    <RedoOutlined
                      onClick={() => {
                        form?.setFields([
                          { name: 'key', value: randomKey(), validated: false, errors: [] },
                        ]);
                      }}
                    />
                  </Typography.Link>
                )
              }
            />
          </Form.Item>
        </Col>
        <Col span={11} offset={2}>
          <Form.Item name="expired" label="Expired Time">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              showNow={false}
              className="w-full"
              minDate={dayjs().add(1, 'days')}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Short Url"
            layout="horizontal"
            shouldUpdate={(prevValues, nextValues) => {
              return prevValues.key !== nextValues.key;
            }}
          >
            {({ getFieldValue }) => {
              const key = getFieldValue('key');
              if (!key) return '';
              return <Typography.Link>{`${window.location.origin}/${key}`}</Typography.Link>;
            }}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="original"
            label="Original Link"
            rules={[
              { required: true, message: 'Please fill the original link!', whitespace: true },
              {
                type: 'url',
                message: 'Please fill in the correct original key!',
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
        </Col>
      </Row>
    </Modal>
  );
});
const Shorten = () => {
  const { md } = useResponsive();
  const editModalRef = useRef<ElementRef<typeof EditModal>>(null);
  const {
    data: res,
    loading,
    refresh,
  } = useRequest(() => axios.get('/api/shorten/list'), {
    onError: (e) => {
      console.log('e', e);
    },
  });
  const [search, setSearch] = useState('');
  const data = useMemo<DataType[]>(() => {
    if (!search) {
      return res?.data.data;
    }
    return res?.data.data.filter(
      (ele: DataType) => ele.short.includes(search) || ele.original.includes(search),
    );
  }, [search, res?.data.data]);
  const columns: TableColumnsType<DataType> = [
    {
      title: 'ID',
      key: 'id',
      width: 60,
      render: (_, __, i) => i + 1,
      responsive: ['md'],
    },
    {
      title: 'Key',
      dataIndex: 'key',
      width: md ? undefined : '25%',
      render: (text) => {
        if (md) {
          return text;
        }

        return (
          <Typography.Link
            href={`${window.location.origin}/${text}`}
            target="_blank"
            rel="noreferrer"
          >
            {text}
          </Typography.Link>
        );
      },
    },
    {
      title: 'Short Link',
      dataIndex: 'short',
      responsive: ['md'],
      render: (text) => (
        <Typography.Link href={text} target="_blank" rel="noreferrer">
          {text}
        </Typography.Link>
      ),
    },
    {
      title: 'Original Link',
      dataIndex: 'original',
      width: '50%',
      render: (text) => (
        <Typography.Link href={text} target="_blank" rel="noreferrer">
          <Typography.Paragraph
            style={{ marginBottom: 0, color: 'inherit' }}
            ellipsis={{ rows: 2 }}
          >
            {text}
          </Typography.Paragraph>
        </Typography.Link>
      ),
    },
    {
      title: 'Expired Time',
      dataIndex: 'expired',
      responsive: ['md'],
      render: (text) => {
        if (!text) return '-';
        if (dayjs(text) > dayjs()) {
          return text;
        }
        return <Typography.Text type="danger">{text}</Typography.Text>;
      },
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      responsive: ['md'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, item) => (
        <Space size={[16, 8]} wrap>
          <Typography.Link
            onClick={() => {
              editModalRef.current?.edit({
                type: 'edit',
                key: item.key,
              });
            }}
          >
            编辑
          </Typography.Link>
          <Popconfirm
            title="Delete Url"
            description="Are you sure to delete this url?"
            onConfirm={() => editModalRef.current?.delete(item.key)}
            okText="Confirm"
            okButtonProps={{ danger: true }}
          >
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="flex-1 p-12">
      <Flex wrap gap="8px 16px">
        <Button type="primary" onClick={() => editModalRef.current?.edit({ type: 'add' })}>
          Create Link
        </Button>
        <Input.Search
          placeholder="Search Short/Original Link"
          style={{ width: 'min(288px, 100%)' }}
          enterButton="Search"
          onSearch={(value) => {
            setSearch(value);
          }}
        />
      </Flex>
      <Table
        loading={loading}
        bordered
        columns={columns}
        dataSource={data}
        className="mt-8"
        size="middle"
        pagination={false}
      />
      <EditModal ref={editModalRef} refresh={refresh} list={res?.data.data} />
    </div>
  );
};
export default Shorten;
