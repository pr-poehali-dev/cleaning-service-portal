import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  login: string;
};

type Order = {
  id: string;
  userId: string;
  address: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  paymentType: string;
  status: 'new' | 'completed' | 'cancelled';
  cancelReason?: string;
  createdAt: Date;
};

const serviceTypes = [
  { value: 'general', label: 'Общий клининг', icon: 'Sparkles' },
  { value: 'deep', label: 'Генеральная уборка', icon: 'Home' },
  { value: 'construction', label: 'Послестроительная уборка', icon: 'HardHat' },
  { value: 'carpet', label: 'Химчистка ковров и мебели', icon: 'Sofa' },
];

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    login: '',
    password: '',
  });

  const [loginForm, setLoginForm] = useState({
    login: '',
    password: '',
  });

  const [orderForm, setOrderForm] = useState({
    address: '',
    phone: '',
    serviceType: '',
    date: '',
    time: '',
    paymentType: '',
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.phone || !registerForm.email || !registerForm.login || !registerForm.password) {
      toast({
        title: 'Ошибка',
        description: 'Все поля обязательны для заполнения',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...registerForm,
    };
    setUsers([...users, newUser]);
    toast({
      title: 'Успешно!',
      description: 'Вы успешно зарегистрированы',
    });
    setRegisterForm({ fullName: '', phone: '', email: '', login: '', password: '' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginForm.login === 'adminka' && loginForm.password === 'password') {
      setIsAdmin(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вход в панель администратора',
      });
      return;
    }

    const user = users.find(u => u.login === loginForm.login);
    if (user) {
      setCurrentUser(user);
      toast({
        title: 'Добро пожаловать!',
        description: `Рады видеть вас, ${user.fullName}`,
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный логин или пароль',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!orderForm.address || !orderForm.phone || !orderForm.serviceType || !orderForm.date || !orderForm.time || !orderForm.paymentType) {
      toast({
        title: 'Ошибка',
        description: 'Все поля обязательны для заполнения',
        variant: 'destructive',
      });
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: currentUser.id,
      ...orderForm,
      status: 'new',
      createdAt: new Date(),
    };
    setOrders([...orders, newOrder]);
    toast({
      title: 'Заявка создана!',
      description: 'Ваша заявка успешно отправлена',
    });
    setOrderForm({ address: '', phone: '', serviceType: '', date: '', time: '', paymentType: '' });
  };

  const handleOrderStatusChange = (orderId: string, status: 'completed' | 'cancelled', reason?: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status, cancelReason: reason } 
        : order
    ));
    toast({
      title: 'Статус обновлен',
      description: `Заявка ${status === 'completed' ? 'выполнена' : 'отменена'}`,
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      new: { variant: 'default' as const, label: 'Новая' },
      completed: { variant: 'default' as const, label: 'Выполнена', className: 'bg-green-500' },
      cancelled: { variant: 'destructive' as const, label: 'Отменена' },
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginForm({ login: '', password: '' });
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Панель администратора</h1>
              <p className="text-muted-foreground">Управление заявками</p>
            </div>
            <Button onClick={logout} variant="outline">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>

          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="ClipboardList" className="h-5 w-5" />
                Все заявки
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Inbox" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Заявок пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const user = users.find(u => u.id === order.userId);
                    const service = serviceTypes.find(s => s.value === order.serviceType);
                    return (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name={service?.icon as any} className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">{service?.label}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">Заявка #{order.id}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Заказчик</p>
                              <p className="text-sm">{user?.fullName || 'Неизвестный пользователь'}</p>
                              <p className="text-sm text-muted-foreground">{order.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Адрес</p>
                              <p className="text-sm">{order.address}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Дата и время</p>
                              <p className="text-sm">{order.date} в {order.time}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Оплата</p>
                              <p className="text-sm">{order.paymentType === 'cash' ? 'Наличные' : 'Банковская карта'}</p>
                            </div>
                          </div>

                          {order.cancelReason && (
                            <div className="bg-destructive/10 p-3 rounded-md mb-4">
                              <p className="text-sm font-medium text-destructive mb-1">Причина отмены</p>
                              <p className="text-sm">{order.cancelReason}</p>
                            </div>
                          )}

                          {order.status === 'new' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleOrderStatusChange(order.id, 'completed')}
                                className="flex-1"
                              >
                                <Icon name="CheckCircle" className="mr-2 h-4 w-4" />
                                Выполнено
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt('Укажите причину отмены:');
                                  if (reason) handleOrderStatusChange(order.id, 'cancelled', reason);
                                }}
                                className="flex-1"
                              >
                                <Icon name="XCircle" className="mr-2 h-4 w-4" />
                                Отменить
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentUser) {
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Добро пожаловать, {currentUser.fullName}!</p>
            </div>
            <Button onClick={logout} variant="outline">
              <Icon name="LogOut" className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" className="h-5 w-5" />
                  Новая заявка
                </CardTitle>
                <CardDescription>Заполните форму для создания заявки на уборку</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      placeholder="Введите адрес"
                      value={orderForm.address}
                      onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Контактный телефон</Label>
                    <Input
                      id="phone"
                      placeholder="+7 (900) 123-45-67"
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Вид услуги</Label>
                    <Select value={orderForm.serviceType} onValueChange={(value) => setOrderForm({ ...orderForm, serviceType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите услугу" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex items-center gap-2">
                              <Icon name={service.icon as any} className="h-4 w-4" />
                              {service.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Дата</Label>
                      <Input
                        id="date"
                        type="date"
                        value={orderForm.date}
                        onChange={(e) => setOrderForm({ ...orderForm, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Время</Label>
                      <Input
                        id="time"
                        type="time"
                        value={orderForm.time}
                        onChange={(e) => setOrderForm({ ...orderForm, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Способ оплаты</Label>
                    <RadioGroup value={orderForm.paymentType} onValueChange={(value) => setOrderForm({ ...orderForm, paymentType: value })}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="font-normal cursor-pointer">
                          <Icon name="Banknote" className="inline h-4 w-4 mr-1" />
                          Наличные
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="font-normal cursor-pointer">
                          <Icon name="CreditCard" className="inline h-4 w-4 mr-1" />
                          Банковская карта
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full gradient-primary">
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить заявку
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" className="h-5 w-5" />
                  История заявок
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="FileX" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">У вас пока нет заявок</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => {
                      const service = serviceTypes.find(s => s.value === order.serviceType);
                      return (
                        <Card key={order.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="pt-4 pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Icon name={service?.icon as any} className="h-4 w-4 text-primary" />
                                <p className="text-sm font-medium">{service?.label}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{order.date} в {order.time}</p>
                            <p className="text-xs text-muted-foreground">{order.address}</p>
                            {order.cancelReason && (
                              <p className="text-xs text-destructive mt-2">{order.cancelReason}</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-lg">
              <Icon name="Sparkles" className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">Мой Не Сам</h1>
          <p className="text-xl text-muted-foreground">Портал клининговых услуг</p>
        </div>

        <Card className="animate-scale-in">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Вход в систему</CardTitle>
                <CardDescription>Введите свои данные для входа</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-login">Логин</Label>
                    <Input
                      id="login-login"
                      placeholder="Введите логин"
                      value={loginForm.login}
                      onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Введите пароль"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary">
                    <Icon name="LogIn" className="mr-2 h-4 w-4" />
                    Войти
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>Создайте новый аккаунт</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ФИО</Label>
                    <Input
                      id="fullName"
                      placeholder="Иванов Иван Иванович"
                      value={registerForm.fullName}
                      onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      placeholder="+7 (900) 123-45-67"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@mail.ru"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-login">Логин</Label>
                    <Input
                      id="register-login"
                      placeholder="Придумайте логин"
                      value={registerForm.login}
                      onChange={(e) => setRegisterForm({ ...registerForm, login: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Придумайте пароль"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary">
                    <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                    Зарегистрироваться
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {serviceTypes.map((service) => (
            <Card key={service.value} className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-3 rounded-full w-fit mx-auto mb-3">
                  <Icon name={service.icon as any} className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">{service.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;