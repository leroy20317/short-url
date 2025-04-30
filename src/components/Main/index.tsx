import { LinkOutlined, PlusOutlined, RedoOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Card, Col, DatePicker, Form, Popconfirm, Row } from 'antd';
import { Button, Input, Space, Typography } from 'antd';
import type { ElementRef } from 'react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import axios from 'axios';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable, ModalForm } from '@ant-design/pro-components';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ');

type DataType = {
  id: number;
  title: string;
  key: string;
  original: string;
  clicks: number;
  expired: string;
};

const EditModal = forwardRef<
  {
    edit: (data: { type: 'edit' | 'add'; key?: string }) => void;
    delete: (key: string) => Promise<any>;
  },
  { refresh: () => void; list?: DataType[] }
>(({ refresh, list }, ref) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const { runAsync } = useRequest((data) => axios.post('/api/shorten/edit', data), {
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
      form.resetFields();
      if (key) {
        const current = list?.find((ele) => ele.key === key);
        if (current) {
          form.setFieldsValue({
            key: current.key,
            original: current.original,
            expired: current.expired ? dayjs(current.expired) : undefined,
            title: current.title,
          });
          return;
        }
      }
    },
    delete: (key) => {
      return runAsync({ type: 'delete', key });
    },
  }));

  return (
    <ModalForm<{ key: string; expired?: Dayjs; original: string; title?: string }>
      open={modalOpen}
      onOpenChange={setModalOpen}
      layout="vertical"
      width={500}
      form={form}
      clearOnDestroy
      requiredMark={false}
      modalProps={{
        okText: isEdit ? '编辑' : '创建',
        cancelText: '取消',
        className: 'rounded-lg',
        okButtonProps: {
          className: 'bg-gradient-to-r from-blue-500 to-indigo-600 border-0',
        },
      }}
      onFinish={async ({ key, original, expired, title }) => {
        const data = {
          type: isEdit ? 'edit' : 'add',
          key,
          original,
          expired,
          title,
        };
        console.log('data', data, expired);
        if (!isEdit) {
          console.log('isEdit', isEdit, key, list);
          const current = list?.find((ele) => ele.key === key);
          if (current) {
            modal.confirm({
              title: `是否替换已存在的${key}`,
              content: (
                <>
                  原始链接：
                  <Typography.Link href={current.original} target="_blank" rel="noreferrer">
                    {current.original}
                  </Typography.Link>
                </>
              ),
              okText: '确认',
              onOk: () => {
                data.type = 'edit';
                return runAsync(data);
              },
              okButtonProps: {
                className: 'bg-gradient-to-r from-blue-500 to-indigo-600 border-0',
              },
            });
            return false;
          }
        }
        await runAsync(data);
        return true;
      }}
    >
      <Form.Item noStyle name="edit" />
      <Row>
        <Col span={11}>
          <Form.Item
            name="key"
            label="短链Key"
            rules={[
              { required: true, message: '请输入Key!' },
              {
                pattern: /^\w[\w_-]{2,}$/,
                message: '请输入正确的Key!',
              },
            ]}
          >
            <Input
              disabled={isEdit}
              maxLength={15}
              className="rounded-lg"
              suffix={
                !isEdit && (
                  <Typography.Link>
                    <RedoOutlined
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => {
                        form?.setFields([
                          { name: 'key', value: nanoid(8), validated: false, errors: [] },
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
          <Form.Item name="title" label="标题">
            <Input className="w-full rounded-lg" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="expired" label="过期时间">
            <DatePicker
              showTime
              showNow={false}
              className="w-full rounded-lg"
              minDate={dayjs().add(1, 'days')}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="短链"
            layout="horizontal"
            shouldUpdate={(prevValues, nextValues) => {
              return prevValues.key !== nextValues.key;
            }}
          >
            {({ getFieldValue }) => {
              const key = getFieldValue('key');
              if (!key) return '';
              return (
                <Typography.Link className="text-indigo-600">{`${window.location.origin}/${key}`}</Typography.Link>
              );
            }}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="original"
            label="原始链接"
            rules={[
              { required: true, message: '请输入原始链接!', whitespace: true },
              {
                type: 'url',
                message: '请输入正确的原始链接!',
              },
            ]}
          >
            <Input.TextArea className="rounded-lg" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
});

const Main = () => {
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
      (ele: DataType) => ele.key.includes(search) || ele.original.includes(search),
    );
  }, [search, res?.data.data]);

  const columns: ProColumns<DataType>[] = [
    {
      title: '序号',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '短链',
      key: 'short',
      render: (_, entity) => (
        <Typography.Link
          className="text-indigo-600 hover:text-indigo-800"
          href={`${window.location.origin}/${entity.key}`}
          target="_blank"
          rel="noreferrer"
        >
          {entity.key}
        </Typography.Link>
      ),
    },
    {
      title: '原始链接',
      dataIndex: 'original',
      width: '50%',
      render: (dom, entity) => (
        <Typography.Link href={entity.original} target="_blank" rel="noreferrer">
          <Typography.Paragraph
            style={{ marginBottom: 0, color: 'inherit' }}
            ellipsis={{ rows: 2 }}
          >
            {entity.original}
          </Typography.Paragraph>
        </Typography.Link>
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expired',
      render: (dom, entity) => {
        if (!entity.expired) return '-';
        const expired = dayjs(entity.expired);
        if (expired > dayjs()) {
          return expired.format('YYYY-MM-DD HH:mm');
        }
        return (
          <Typography.Text type="danger">{expired.format('YYYY-MM-DD HH:mm')}</Typography.Text>
        );
      },
    },
    {
      title: '点击量',
      dataIndex: 'clicks',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, item) => (
        <Space size={[16, 8]} wrap>
          <Typography.Link
            className="text-indigo-600 hover:text-indigo-800"
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
            title="删除链接"
            description="确定删除该链接吗？"
            onConfirm={() => editModalRef.current?.delete(item.key)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{
              danger: true,
              className: 'bg-red-500 hover:bg-red-600',
            }}
          >
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-6 md:p-12">
      <div className="flex justify-center items-center mb-8">
        <LinkOutlined className="text-3xl text-indigo-600 mr-2" />
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 mb-0">
          短链系统
        </h1>
      </div>

      <Card
        className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{ marginBottom: 20 }}
      >
        <Space size={[20, 0]}>
          <Button
            type="primary"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0 rounded-lg hover:from-blue-600 hover:to-indigo-700 flex items-center"
            onClick={() => editModalRef.current?.edit({ type: 'add' })}
            icon={<PlusOutlined />}
          >
            创建链接
          </Button>
          <Input.Search
            placeholder="搜索短/原始链接"
            style={{ width: 'min(288px, 100%)' }}
            enterButton={
              <Button
                type="primary"
                className="bg-gradient-to-r from-blue-400 to-indigo-500 border-0"
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
            }
            className="rounded-lg"
            onSearch={(value) => {
              setSearch(value);
            }}
          />
        </Space>
      </Card>

      <Card className="rounded-xl shadow-lg overflow-hidden">
        <ProTable
          loading={loading}
          bordered
          columns={columns}
          dataSource={data}
          search={false}
          defaultSize="middle"
          pagination={false}
          className="custom-table"
        />
      </Card>

      <EditModal ref={editModalRef} refresh={refresh} list={res?.data.data} />

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(to right, #f0f5ff, #e6f7ff);
          color: #1e40af;
        }
        .pagination-gradient .ant-pagination-item-active {
          background: linear-gradient(to right, #3b82f6, #6366f1);
          border-color: #3b82f6;
        }
        .pagination-gradient .ant-pagination-item-active a {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Main;
