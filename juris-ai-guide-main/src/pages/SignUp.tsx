import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Globe,
  FileText,
  Award,
  Users,
  Plus,
  X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import axios from '../axios';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  userType: 'user' | 'lawyer';
}

interface LawyerFormData {
  // Professional Information
  barNumber: string;
  barAssociation: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  lawSchool: string;
  graduationYear: number;
  
  // Contact Information
  phone: string;
  officeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  website: string;
  
  // Specializations
  specializations: string[];
  languages: string[];
  
  // Professional Summary
  bio: string;
  achievements: string[];
  
  // References
  references: Array<{
    name: string;
    title: string;
    organization: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
}

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // User form data
  const [userFormData, setUserFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    userType: 'user'
  });

  // Lawyer form data
  const [lawyerFormData, setLawyerFormData] = useState<LawyerFormData>({
    barNumber: '',
    barAssociation: '',
    practiceAreas: [],
    yearsOfExperience: 0,
    lawSchool: '',
    graduationYear: new Date().getFullYear(),
    phone: '',
    officeAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    website: '',
    specializations: [],
    languages: [],
    bio: '',
    achievements: [],
    references: []
  });

  // Form helpers
  const [newPracticeArea, setNewPracticeArea] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const practiceAreaOptions = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law', 
    'Property Law', 'Employment Law', 'Intellectual Property', 
    'Tax Law', 'Environmental Law', 'Immigration Law', 'Other'
  ];

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/signUp", {
        ...userFormData,
        userType: 'user'
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
          variant: "default",
        });
        setTimeout(() => navigate("/signIn"), 1000);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.response?.data?.message || "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLawyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/signUp", {
        ...userFormData,
        userType: 'lawyer',
        lawyerData: lawyerFormData
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        setTimeout(() => navigate("/signIn"), 1000);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.response?.data?.message || "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for lawyer form
  const addPracticeArea = () => {
    if (newPracticeArea.trim() && !lawyerFormData.practiceAreas.includes(newPracticeArea.trim())) {
      setLawyerFormData(prev => ({
        ...prev,
        practiceAreas: [...prev.practiceAreas, newPracticeArea.trim()]
      }));
      setNewPracticeArea('');
    }
  };

  const removePracticeArea = (area: string) => {
    setLawyerFormData(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.filter(a => a !== area)
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !lawyerFormData.specializations.includes(newSpecialization.trim())) {
      setLawyerFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setLawyerFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !lawyerFormData.languages.includes(newLanguage.trim())) {
      setLawyerFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang: string) => {
    setLawyerFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== lang)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !lawyerFormData.achievements.includes(newAchievement.trim())) {
      setLawyerFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setLawyerFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const addReference = () => {
    setLawyerFormData(prev => ({
      ...prev,
      references: [...prev.references, {
        name: '',
        title: '',
        organization: '',
        email: '',
        phone: '',
        relationship: ''
      }]
    }));
  };

  const removeReference = (index: number) => {
    setLawyerFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const updateReference = (index: number, field: string, value: string) => {
    setLawyerFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  return (
    <>
      <Header />
      <div className='w-full h-full flex flex-col justify-center items-center p-4 min-h-screen bg-gray-50'>
        <Card className="w-full max-w-4xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Choose your account type and get started
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Regular User
              </TabsTrigger>
              <TabsTrigger value="lawyer" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Lawyer
              </TabsTrigger>
            </TabsList>

            {/* Regular User Tab */}
            <TabsContent value="user">
              <form onSubmit={handleUserSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="username"
                        type="text"
                        className="pl-9"
                        value={userFormData.username}
                        onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="m@example.com"
                        type="email"
                        className="pl-9"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-9 pr-9"
                        placeholder="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create User Account"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/signIn" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Lawyer Tab */}
            <TabsContent value="lawyer">
              <form onSubmit={handleLawyerSubmit}>
                <CardContent className="space-y-6">
                  {/* Basic User Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lawyer-username">Username</Label>
                        <Input
                          id="lawyer-username"
                          placeholder="username"
                          value={userFormData.username}
                          onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lawyer-email">Email</Label>
                        <Input
                          id="lawyer-email"
                          placeholder="m@example.com"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lawyer-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="lawyer-password"
                          type={showPassword ? "text" : "password"}
                          className="pr-9"
                          placeholder="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Professional Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="barNumber">Bar Number *</Label>
                        <Input
                          id="barNumber"
                          placeholder="e.g., 12345"
                          value={lawyerFormData.barNumber}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, barNumber: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="barAssociation">Bar Association *</Label>
                        <Input
                          id="barAssociation"
                          placeholder="e.g., California State Bar"
                          value={lawyerFormData.barAssociation}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, barAssociation: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lawSchool">Law School *</Label>
                        <Input
                          id="lawSchool"
                          placeholder="e.g., Harvard Law School"
                          value={lawyerFormData.lawSchool}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, lawSchool: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year *</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          placeholder="e.g., 2020"
                          value={lawyerFormData.graduationYear}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, graduationYear: parseInt(e.target.value) || 0 })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        placeholder="e.g., 5"
                        value={lawyerFormData.yearsOfExperience}
                        onChange={(e) => setLawyerFormData({ ...lawyerFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    {/* Practice Areas */}
                    <div className="space-y-2">
                      <Label>Practice Areas *</Label>
                      <div className="flex gap-2">
                        <Select onValueChange={(value) => {
                          if (value && !lawyerFormData.practiceAreas.includes(value)) {
                            setLawyerFormData(prev => ({
                              ...prev,
                              practiceAreas: [...prev.practiceAreas, value]
                            }));
                          }
                        }}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select practice area" />
                          </SelectTrigger>
                          <SelectContent>
                            {practiceAreaOptions.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" onClick={addPracticeArea} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {lawyerFormData.practiceAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lawyerFormData.practiceAreas.map((area, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {area}
                              <button
                                type="button"
                                onClick={() => removePracticeArea(area)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          value={lawyerFormData.phone}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://yourwebsite.com"
                          value={lawyerFormData.website}
                          onChange={(e) => setLawyerFormData({ ...lawyerFormData, website: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Office Address */}
                    <div className="space-y-4">
                      <Label>Office Address *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input
                            placeholder="Street Address"
                            value={lawyerFormData.officeAddress.street}
                            onChange={(e) => setLawyerFormData({
                              ...lawyerFormData,
                              officeAddress: { ...lawyerFormData.officeAddress, street: e.target.value }
                            })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="City"
                            value={lawyerFormData.officeAddress.city}
                            onChange={(e) => setLawyerFormData({
                              ...lawyerFormData,
                              officeAddress: { ...lawyerFormData.officeAddress, city: e.target.value }
                            })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Select
                            value={lawyerFormData.officeAddress.state}
                            onValueChange={(value) => setLawyerFormData({
                              ...lawyerFormData,
                              officeAddress: { ...lawyerFormData.officeAddress, state: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              {stateOptions.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="ZIP Code"
                            value={lawyerFormData.officeAddress.zipCode}
                            onChange={(e) => setLawyerFormData({
                              ...lawyerFormData,
                              officeAddress: { ...lawyerFormData.officeAddress, zipCode: e.target.value }
                            })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Professional Summary
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio * (Min 100 characters)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your legal expertise, experience, and approach to helping clients..."
                        rows={4}
                        value={lawyerFormData.bio}
                        onChange={(e) => setLawyerFormData({ ...lawyerFormData, bio: e.target.value })}
                        required
                        minLength={100}
                      />
                      <p className="text-sm text-muted-foreground">
                        {lawyerFormData.bio.length}/1000 characters
                      </p>
                    </div>

                    {/* Specializations */}
                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add specialization"
                          value={newSpecialization}
                          onChange={(e) => setNewSpecialization(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                        />
                        <Button type="button" onClick={addSpecialization} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {lawyerFormData.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lawyerFormData.specializations.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {spec}
                              <button
                                type="button"
                                onClick={() => removeSpecialization(spec)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                      <Label>Languages Spoken</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add language"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        />
                        <Button type="button" onClick={addLanguage} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {lawyerFormData.languages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lawyerFormData.languages.map((lang, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {lang}
                              <button
                                type="button"
                                onClick={() => removeLanguage(lang)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                      <Label>Professional Achievements</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add achievement"
                          value={newAchievement}
                          onChange={(e) => setNewAchievement(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        />
                        <Button type="button" onClick={addAchievement} variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {lawyerFormData.achievements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lawyerFormData.achievements.map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {achievement}
                              <button
                                type="button"
                                onClick={() => removeAchievement(achievement)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* References */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Professional References
                      </h3>
                      <Button type="button" onClick={addReference} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Add Reference
                      </Button>
                    </div>
                    
                    {lawyerFormData.references.map((reference, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Reference {index + 1}</h4>
                          <Button
                            type="button"
                            onClick={() => removeReference(index)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              placeholder="Full Name"
                              value={reference.name}
                              onChange={(e) => updateReference(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="Professional Title"
                              value={reference.title}
                              onChange={(e) => updateReference(index, 'title', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Organization</Label>
                            <Input
                              placeholder="Company/Organization"
                              value={reference.organization}
                              onChange={(e) => updateReference(index, 'organization', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              placeholder="Email Address"
                              type="email"
                              value={reference.email}
                              onChange={(e) => updateReference(index, 'email', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              placeholder="Phone Number"
                              value={reference.phone}
                              onChange={(e) => updateReference(index, 'phone', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Input
                              placeholder="e.g., Former colleague, Client, etc."
                              value={reference.relationship}
                              onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Submitting application..." : "Submit Lawyer Application"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/signIn" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
};

export default SignUp;