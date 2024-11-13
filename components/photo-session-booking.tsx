  'use client'

  import React, { useState, FormEvent } from 'react'
  import Link from "next/link"
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
  import { Label } from "@/components/ui/label"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"
  import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
  import { Button } from "@/components/ui/button"
  import { Calendar } from "@/components/ui/calendar"
  import { CalendarIcon, CameraIcon, PaperclipIcon } from 'lucide-react'
  import toast, { Toaster } from 'react-hot-toast'
  import { useTelegramWebApp } from "@/app/hooks/useTelegramWebApp"

  interface FormData {
    name: string;
    email: string;
    phone: string;
    description: string;
    date: Date | undefined;
  }

  const initialFormData: FormData = {
    name: '',
    email: '',
    phone: '',
    description: '',
    date: undefined,
  }

  export function PhotoSessionBooking() {
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const webApp = useTelegramWebApp();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleDateChange = (date: Date | undefined) => {
      setFormData(prev => ({ ...prev, date }))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (formData.name && formData.email && formData.phone && formData.description && formData.date) {
        try {
          const formDataToSend = {
            ...formData,
            date: formData.date.toISOString().split('T')[0]
          };

          console.log("Дані для відправки:", formDataToSend);

          if (webApp) {
            webApp.MainButton.setText('Отправка...');
            webApp.MainButton.show();
          }

          const response = await fetch('https://8f83-194-44-179-62.ngrok-free.app/book_session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataToSend),
          });

          if (response.ok) {
            toast.success('Форма відправлена успішно!', {
              position: "bottom-center"
            });
            setFormData(initialFormData)
            if (webApp) {
              webApp.MainButton.setText('Отправлено');
              setTimeout(() => webApp.MainButton.hide(), 2000);
            }
          } else {
            throw new Error('Помилка при відправці форми');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
          toast.error(`Помилка при відправці форми: ${errorMessage}. Спробуйте ще раз.`, {
            position: "bottom-center"
          });
          if (webApp) {
            webApp.MainButton.hide();
          }
        }
      } else {
        toast.error("Будь ласка, заповніть усі поля", {
          position: "bottom-center"
        })
      }
    }

    return (
        <div className="w-full min-h-[100dvh] bg-background">
          <header className="container px-4 md:px-6 py-6 flex items-center justify-between">
            <Link href="#" className="flex items-center gap-2">
              <CameraIcon className="h-6 w-6" />
              <span className="font-semibold text-lg">Ловіть моменти</span>
            </Link>
            <Link href="#"
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Переглянути портфоліо
            </Link>
          </header>
          <main className="container px-4 md:px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Знімайте свої моменти з нашим талановитим фотографом
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Наш досвідчений фотограф працюватиме з вами над створенням приголомшливих, персоналізованих фотографій, які відображатимуть
                  суть вашої особистосі.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Гнучке планування</h3>
                    <p className="text-muted-foreground">Виберіть дату та час, які вам найбільше підходять.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <CameraIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Професійна фотографія</h3>
                    <p className="text-muted-foreground">Наш талановитий фотограф зафіксує ваші особливі моменти.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PaperclipIcon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Персоналізоване редагування</h3>
                    <p className="text-muted-foreground">Ми попрацюємо з вами над редагуванням та покращенням ваших фотографій.</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="w-full max-w-md mx-auto">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-2xl">Замовити фотосесію</CardTitle>
                  <CardDescription>Заповніть форму нижче, щоб запланувати фотосесію.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Імя</Label>
                      <Input
                          id="name"
                          name="name"
                          placeholder="Ваше Ім'я"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Емейл</Label>
                      <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="blank@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(123) 456-7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Коментар</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Розкажіть нам про бажану фотосесію"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Дата</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? formData.date.toDateString() : "Обрати дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={handleDateChange}
                            initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Замовляйте зараз</Button>
                  <Toaster/>
                </CardFooter>
              </form>
            </Card>
          </main>
        </div>
    )
  }