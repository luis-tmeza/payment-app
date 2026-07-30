import { Type } from 'class-transformer';
import { Equals, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Matches, Max, Min } from 'class-validator';

export class CreateCheckoutTransactionDto {
  @IsUUID()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quantity!: number;

  @IsString() @IsNotEmpty() fullName!: string;
  @IsEmail() email!: string;
  @IsString() @Length(7, 20) phone!: string;
  @IsString() @Length(2, 5) documentType!: string;
  @IsString() @Length(4, 30) document!: string;
  @IsString() @Length(5, 120) addressLine!: string;
  @IsString() @Length(2, 80) city!: string;
  @IsString() @Length(2, 80) region!: string;
  @IsOptional() @IsString() notes?: string;

  @Matches(/^\d{13,19}$/)
  cardNumber!: string;

  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
  cardExpiration!: string;

  @Matches(/^\d{3,4}$/)
  cardCvv!: string;

  @IsString() @Length(5, 100) cardholderName!: string;

  @Equals(true, { message: 'Terms acceptance is required' })
  acceptedTerms!: boolean;

  @Equals(true, { message: 'Personal data authorization is required' })
  acceptedPersonalData!: boolean;
}